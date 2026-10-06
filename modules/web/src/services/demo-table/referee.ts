import { applySettings, changedSettings } from '@telephone-table/engine';
import {
  chatMaxLength,
  cleanPersonName,
  defaultGameSettings,
  gameLimits,
  type BoardFill,
  type GameSettings,
  type StrokeBatch,
  type TableIntents,
  type TableIntentType,
} from '@telephone-table/protocol';
import type { TableLinkListeners } from '../types';
import { DemoBots } from './bots';
import { DemoDoodle } from './doodle';
import { DemoFeed } from './feed';
import { DemoGame } from './game';
import { demoHandlers, type DemoHandlers, type DemoMoves } from './intents';
import { nextBot } from './rules';
import type { DemoDeps, DemoMember, DemoTableState } from './types';
import { snapshotFor, toPageSnapshot } from './view';

const newSeed = (random: () => number): number => Math.floor(random() * 2 ** 31);

// Plays the server's part in the browser, with sample players (spec D19): who's at the table, the
// settings, the chat and the doodle board here, the game itself in DemoGame. The real server
// (core-api) takes over behind the same snapshots and intents.
export class DemoReferee implements DemoTableState, DemoMoves {
  members: DemoMember[] = [];
  settings: GameSettings = { ...defaultGameSettings };
  readonly game: DemoGame;
  readonly #deps: DemoDeps;
  readonly #out: TableLinkListeners;
  readonly #meId: string;
  readonly #feed: DemoFeed;
  readonly #doodle: DemoDoodle;
  readonly #bots: DemoBots;
  readonly #handlers: DemoHandlers;

  constructor(deps: DemoDeps, out: TableLinkListeners, meId: string) {
    this.#deps = deps;
    this.#out = out;
    this.#meId = meId;
    this.#feed = new DemoFeed(deps);
    this.#doodle = new DemoDoodle(newSeed(deps.random));

    this.game = new DemoGame(deps, {
      members: () => this.members,
      settings: () => this.settings,
      emit: () => this.#emit(),
      page: (page) => out.page(toPageSnapshot(page)),
      stepStarted: (round) => this.#bots.planStep(round),
      pageShown: (reveal) => this.#bots.planPage(reveal, this.#sampleBots(), this.settings.points),
    });

    this.#bots = new DemoBots(deps, {
      chat: (id, text) => this.chat(id, text),
      react: (id, emoji) => out.reaction({ memberId: id, emoji }),
      doodle: (id, batch) => this.doodleStroke(id, batch),
      write: (id, text) => this.write(id, text),
      sketch: (id, name, actions) => this.game.round?.sketch(id, name, actions),
      done: (id) => this.game.done(id),
      turnPage: (id) => this.game.turnPage(id),
      favourite: (id, pageId) => this.game.favourite(id, pageId),
      nextBook: (id) => this.game.nextBook(id),
      like: (id, pageId) => this.game.like(id, pageId, true),
    });

    this.#handlers = demoHandlers(this, this.game);
  }

  get squiggle(): number {
    return this.#doodle.squiggle;
  }

  handle<T extends TableIntentType>(memberId: string, type: T, message: TableIntents[T]): void {
    (this.#handlers[type] as (memberId: string, message: TableIntents[T]) => void)(memberId, message);
  }

  join(member: DemoMember): void {
    this.members.push(member);
    this.#feed.system(member, { type: 'joined' });

    if (member.isBot) this.#bots.greet(member);

    this.game.joined();
    this.#emit();
  }

  leave(memberId: string): void {
    const member = this.#member(memberId);

    if (!member) return;

    this.members = this.members.filter((other) => other !== member);
    this.#feed.system(member, { type: 'left' });
    this.game.left(memberId);
    this.#emit();
  }

  start(memberId: string): void {
    const starter = this.#member(memberId);

    if (!starter || !this.game.start()) return;

    // The doodle board is wiped as round 1 starts (spec D22).
    this.#doodle.reset(newSeed(this.#deps.random));
    this.#out.doodleDrawing([]);
    this.#feed.system(starter, { type: 'started', rounds: this.settings.rounds });
    this.#emit();
  }

  updateSettings(memberId: string, patch: Partial<GameSettings>): void {
    const author = this.#member(memberId);

    if (this.game.phase !== 'lobby' || !author) return;

    const next = applySettings(this.settings, patch);

    changedSettings(this.settings, next).forEach((setting) => this.#feed.system(author, { type: 'setting', setting, value: next[setting] }));
    this.settings = next;
    this.#emit();
  }

  chat(memberId: string, text: string): void {
    const author = this.#member(memberId);
    const clean = text.trim().slice(0, chatMaxLength);

    if (!author || !clean) return;

    this.#feed.message(author, clean);
    this.#emit();
  }

  rename(memberId: string, name: string): void {
    const member = this.#member(memberId);
    const clean = cleanPersonName(name);

    if (!member || !clean || clean === member.name) return;

    member.name = clean;
    this.#feed.system(member, { type: 'renamed', name: clean });
    this.#emit();
  }

  // The doodle board takes lines only in the lobby, and passes them on at once (spec D22).
  doodleStroke(memberId: string, batch: StrokeBatch): void {
    if (this.game.phase !== 'lobby') return;

    this.#doodle.stroke(memberId, batch);

    if (memberId !== this.#meId) this.#out.doodle({ type: 'stroke', authorId: memberId, batch });
  }

  doodleFill(memberId: string, fill: BoardFill): void {
    if (this.game.phase === 'lobby') this.#doodle.fill(memberId, fill);
  }

  doodleUndo(memberId: string): void {
    if (this.game.phase === 'lobby') this.#doodle.undo(memberId);
  }

  doodleSquiggle(memberId: string): void {
    const member = this.#member(memberId);

    if (this.game.phase !== 'lobby' || !member) return;

    this.#doodle.reset(newSeed(this.#deps.random));
    this.#out.doodleDrawing([]);
    this.#feed.system(member, { type: 'squiggle' });
    this.#emit();
  }

  write(memberId: string, text: string): void {
    this.game.round?.write(memberId, text);
  }

  stroke(memberId: string, batch: StrokeBatch): void {
    this.game.round?.stroke(memberId, batch);
  }

  fill(memberId: string, fill: BoardFill): void {
    this.game.round?.fill(memberId, fill);
  }

  undo(memberId: string): void {
    this.game.round?.undo(memberId);
  }

  clear(memberId: string): void {
    this.game.round?.clear(memberId);
  }

  // Demo buttons. In the lobby, Skip seats enough sample players and starts.
  skip(): void {
    if (this.game.phase === 'lobby') {
      Array.from({ length: Math.max(0, gameLimits.minPlayers - this.members.length) }).forEach(() => this.addBot());
      this.start(this.#meId);
    } else if (this.game.phase === 'podium' || this.game.phase === 'shelf') this.game.playAgain();
    else this.game.skip();
  }

  addBot(): void {
    const bot = nextBot(this.members, this.#deps.createId);

    if (bot && this.members.length < gameLimits.maxPlayers) this.join(bot);
  }

  removeBot(): void {
    const bot = this.members.findLast((member) => member.isBot);

    if (bot) this.leave(bot.id);
  }

  dispose(): void {
    this.game.dispose();
    this.#bots.cancel();
  }

  #sampleBots(): DemoMember[] {
    return this.members.filter((member) => member.isBot);
  }

  #member(id: string): DemoMember | undefined {
    return this.members.find((member) => member.id === id);
  }

  #emit(): void {
    this.#out.snapshot(snapshotFor(this, this.game, this.#feed));
    this.#out.task(this.game.phase === 'step' ? (this.game.round?.task(this.#meId) ?? null) : null);
  }
}
