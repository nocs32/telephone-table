import { randomUUID } from 'node:crypto';
import { ErrorCode, Room, ServerError, type Client } from '@colyseus/core';
import {
  feedMaxItems,
  tableIntentSchemas,
  tableJoinOptionsSchema,
  tableProtocolVersion,
  type BoardOp,
  type TableErrorCode,
  type TableEvents,
  type TableIntents,
  type TableIntentType,
  type TableJoinOptions,
} from '@telephone-table/protocol';
import { customAlphabet } from 'nanoid';
import * as v from 'valibot';
import { limits } from '../limits.js';
import { logger } from '../logger.js';
import { TableRoomDoodle } from './doodle.js';
import { TableRoomError } from './error.js';
import { TableRoomFeed } from './feed.js';
import { TableRoomGame } from './game.js';
import { TableRoomLifecycle, type Schedule } from './lifecycle.js';
import { TableRoomMembers } from './members.js';
import { TableRoomOutbox } from './outbox.js';
import { TableRoomRateLimits } from './rate-limits.js';
import { tableView, taskIdOf, taskOf, toPageWire } from './view.js';

export type TableClient = Client<{ messages: TableEvents }>;

type TableRoomHandler<K extends TableIntentType> = (client: TableClient, message: TableIntents[K]) => void;

const { table } = limits;

// Intents that change nothing in the shared view: no view or feed to send afterwards. Pages are
// saved, never passed on (spec D11), and doodle lines go out on their own.
const quietIntents: ReadonlySet<TableIntentType> = new Set(['sync', 'react', 'doodleStroke', 'doodleFill', 'doodleUndo', 'draft', 'stroke', 'fill', 'undo', 'clear']);

// Refusals that happen in normal play: a fast hand, or a move that crossed a step's end.
const expectedRefusals: ReadonlySet<TableErrorCode> = new Set(['RATE_LIMITED', 'WRONG_PHASE', 'NOT_YOUR_PAGE', 'ALREADY_DONE']);

// 12 characters of [0-9a-z]: about 62 bits, so table links can't be guessed.
const createRoomId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

// The client reads the code from the refused join's error message.
const joinError = (code: TableErrorCode): ServerError => new ServerError(ErrorCode.APPLICATION_ERROR, code);

// A join with bad options, or from a web app on another protocol version, is turned away.
const readJoinOptions = (options: unknown): TableJoinOptions => {
  const result = v.safeParse(tableJoinOptionsSchema, options);

  if (!result.success) throw joinError('INVALID_JOIN');

  if (result.output.protocolVersion !== tableProtocolVersion) throw joinError('PROTOCOL_MISMATCH');

  return result.output;
};

// One shared table. Its parts own the rules: who is here, the game, the doodle board, the feed,
// what each person is sent, rate limits, and when the empty table is thrown away. This class only
// wires them to Colyseus.
export class TableRoom extends Room<{ client: TableClient }> {
  override maxClients = table.maxClients;
  // The lifecycle decides when an empty table goes, not Colyseus.
  override autoDispose = false;
  override maxMessagesPerSecond = table.maxMessagesPerSecond;
  readonly #schedule: Schedule = (callback, delayMs) => {
    const delayed = this.clock.setTimeout(callback, delayMs);

    return () => delayed.clear();
  };

  readonly #members = new TableRoomMembers(Math.random);
  readonly #feed = new TableRoomFeed({ now: Date.now, createId: randomUUID, maxItems: feedMaxItems });
  readonly #rateLimits = new TableRoomRateLimits(table.rates, Date.now);
  readonly #doodle = new TableRoomDoodle({ caps: table.drawing, random: Math.random, isLobby: () => this.#game.phase === 'lobby' });
  readonly #game: TableRoomGame = new TableRoomGame({
    members: this.#members,
    feed: this.#feed,
    schedule: this.#schedule,
    now: Date.now,
    random: Math.random,
    createId: randomUUID,
    started: () => this.#wipeDoodle(),
    turned: (page) => this.broadcast('pages', { pages: [toPageWire(page)] }),
    changed: () => this.#outbox.flush(),
  });

  readonly #outbox = new TableRoomOutbox({
    feed: this.#feed,
    view: () => tableView(this.#members.all, this.#game, this.#doodle.squiggle),
    taskIdFor: (memberId) => taskIdOf(this.#game, memberId),
    taskFor: (memberId) => taskOf(this.#game, memberId),
    pages: () => this.#game.revealedPages.map(toPageWire),
    doodle: () => this.#doodle.encode(),
    now: Date.now,
    send: (memberId, type, message) => this.clients.getById(memberId)?.send(type, message),
    broadcast: (type, message) => this.broadcast(type, message),
  });

  readonly #lifecycle = new TableRoomLifecycle({ schedule: this.#schedule, graceMs: table.emptyGraceMs, close: () => void this.disconnect() });

  override onCreate(): void {
    this.roomId = createRoomId();
    this.#listen();
    this.#lifecycle.open();
    logger.info('table created', { roomId: this.roomId });
  }

  override onJoin(client: TableClient, options: unknown): void {
    const { name } = readJoinOptions(options);
    const member = this.#members.join(client.sessionId, name);

    this.#lifecycle.join();
    this.#feed.system(member, { type: 'joined' });
    this.#game.join();
    this.#outbox.flush();
    logger.info('table joined', { roomId: this.roomId, sessionId: client.sessionId, people: this.#members.count });
  }

  // A lost connection keeps its seat for a while; the browser reconnects on its own and asks
  // for everything again with `sync`.
  override onDrop(client: TableClient): void {
    this.#members.drop(client.sessionId);
    this.#outbox.forget(client.sessionId);
    this.#game.drop(client.sessionId);
    this.#outbox.flush();
    this.allowReconnection(client, table.reconnectSeconds);
  }

  override onReconnect(client: TableClient): void {
    this.#members.reconnect(client.sessionId);
    this.#game.reconnect(client.sessionId);
    this.#outbox.flush();
  }

  override onLeave(client: TableClient): void {
    if (!this.#members.has(client.sessionId)) return;

    const member = this.#members.leave(client.sessionId);

    this.#rateLimits.forget(client.sessionId);
    this.#outbox.forget(client.sessionId);
    this.#feed.system(member, { type: 'left' });
    this.#game.leave(member.id);
    this.#lifecycle.leave(this.#members.count);
    this.#outbox.flush();
    logger.info('table left', { roomId: this.roomId, sessionId: client.sessionId, people: this.#members.count });
  }

  override onDispose(): void {
    this.#game.dispose();
    this.#lifecycle.dispose();
    this.#rateLimits.dispose();
    this.#outbox.dispose();
    logger.info('table closed', { roomId: this.roomId });
  }

  #listen(): void {
    this.#listenToTable();
    this.#listenToDoodle();
    this.#listenToSteps();
    this.#listenToReveal();
  }

  #listenToTable(): void {
    const game = this.#game;

    this.#on('sync', (client) => this.#outbox.sync(client.sessionId));
    this.#on('start', (client) => game.start(client.sessionId));
    this.#on('updateSettings', (client, patch) => game.updateSettings(client.sessionId, patch));
    this.#on('chat', (client, { text }) => this.#feed.message(this.#members.get(client.sessionId), text));
    this.#on('react', (client, { emoji }) => this.broadcast('reaction', { memberId: client.sessionId, emoji }, { except: client }));
    this.#on('rename', (client, { name }) => this.#rename(client, name));
    this.#on('startNow', (client) => game.startNow(client.sessionId));
    this.#on('playAgain', (client) => game.playAgain(client.sessionId));
  }

  // The lobby's doodle board: lines go out live to everyone else (spec D22).
  #listenToDoodle(): void {
    const doodle = this.#doodle;

    this.#on('doodleStroke', (client, batch) => this.#pass(client, doodle.stroke(client.sessionId, batch)));
    this.#on('doodleFill', (client, fill) => this.#pass(client, doodle.fill(client.sessionId, fill)));
    this.#on('doodleUndo', (client) => this.#pass(client, doodle.undo(client.sessionId)));
    this.#on('doodleSquiggle', (client) => this.#rollSquiggle(client));
  }

  // Your page in a step: saved as you go, passed on to nobody (spec D11).
  #listenToSteps(): void {
    const { pages } = this.#game;

    this.#on('draft', (client, { text }) => pages.write(client.sessionId, text));
    this.#on('stroke', (client, batch) => pages.stroke(client.sessionId, batch));
    this.#on('fill', (client, fill) => pages.fill(client.sessionId, fill));
    this.#on('undo', (client) => pages.undo(client.sessionId));
    this.#on('clear', (client) => pages.clear(client.sessionId));
    this.#on('done', (client) => this.#game.done(client.sessionId));
    this.#on('undone', (client) => this.#game.undone(client.sessionId));
  }

  #listenToReveal(): void {
    const game = this.#game;

    this.#on('turnPage', (client) => game.turnPage(client.sessionId));
    this.#on('skipReplay', (client) => game.skipReplay(client.sessionId));
    this.#on('favourite', (client, { pageId }) => game.favourite(client.sessionId, pageId));
    this.#on('nextBook', (client) => game.nextBook(client.sessionId));
    this.#on('like', (client, { pageId, liked }) => game.points.like(client.sessionId, pageId, liked));
    this.#on('stick', (client, { pageId, sticker, x, y }) => game.stickers.stick(client.sessionId, pageId, sticker, x, y));
    this.#on('peel', (client, { stickerId }) => game.stickers.peel(client.sessionId, stickerId));
  }

  // Every handler: validate the message, check the sender's rate, then call the part that owns it,
  // then send out what changed. Anything refused goes back to the sender as an `error` event;
  // nobody gets disconnected for it.
  #on<K extends TableIntentType>(type: K, handle: TableRoomHandler<K>): void {
    this.onMessage(type, (client: TableClient, input: unknown) => {
      const result = v.safeParse(tableIntentSchemas[type], input);

      if (!result.success) return this.#refuse(client, type, 'INVALID_MESSAGE');

      if (!this.#rateLimits.allow(client.sessionId, type)) return this.#refuse(client, type, 'RATE_LIMITED');

      try {
        handle(client, result.output as TableIntents[K]);
      } catch (error) {
        if (!(error instanceof TableRoomError)) throw error;

        this.#refuse(client, type, error.code);
      }

      if (!quietIntents.has(type)) this.#outbox.flush();
    });
  }

  // A doodle line goes to everyone else; the sender has it already.
  #pass(client: TableClient, op: BoardOp): void {
    this.broadcast('doodle', op, { except: client });
  }

  #rollSquiggle(client: TableClient): void {
    this.#doodle.roll();
    this.#feed.system(this.#members.get(client.sessionId), { type: 'squiggle' });
    this.broadcast('doodleDrawing', { bytes: this.#doodle.encode() });
  }

  #wipeDoodle(): void {
    this.#doodle.wipe();
    this.broadcast('doodleDrawing', { bytes: this.#doodle.encode() });
  }

  #rename(client: TableClient, text: string): void {
    const name = this.#members.rename(client.sessionId, text);

    if (name !== null) this.#feed.system(this.#members.get(client.sessionId), { type: 'renamed', name });
  }

  #refuse(client: TableClient, type: TableIntentType, code: TableErrorCode): void {
    if (!expectedRefusals.has(code)) logger.warn('table message refused', { roomId: this.roomId, sessionId: client.sessionId, type, code });

    client.send('error', { code, type });
  }
}
