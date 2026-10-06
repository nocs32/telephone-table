import {
  personNameMaxLength,
  type BoardAction,
  type BoardOp,
  type PageSnapshot,
  type TableErrorEvent,
  type TableReactionEvent,
  type TableSnapshot,
  type TaskSnapshot,
} from '@telephone-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { DemoControls, Services } from '../../services';
import type { LocaleStore, Translate } from '../locale';
import { NameFieldStore } from '../name-field';
import type { UiStore } from '../ui';
import type { RoomBoardStore } from './board';
import { RoomBooksStore } from './books';
import { RoomChatPaceStore } from './chat-pace';
import { RoomConnectionStore } from './connection';
import { RoomDoodleStore } from './doodle';
import { RoomFeedStore } from './feed';
import { RoomGameStore } from './game';
import { RoomPresenceStore } from './presence';
import { RoomReactionsStore } from './reactions';
import { RoomRevealStore } from './reveal';
import { RoomShareStore } from './share';
import { RoomShelfStore } from './shelf';
import { RoomStepStore } from './step';
import type { TableSend } from './types';

// The table sends; the room hands it to its parts. Wrapped, because the room's actions are bound
// only once its constructor has run makeAutoObservable.
const createConnection = (room: RoomStore, services: Services, t: Translate): RoomConnectionStore =>
  new RoomConnectionStore({
    ...services,
    t,
    receivers: {
      snapshot: (snapshot) => room.receiveSnapshot(snapshot),
      task: (task) => room.receiveTask(task),
      page: (page) => room.receivePage(page),
      doodle: (op) => room.receiveDoodle(op),
      doodleDrawing: (actions) => room.receiveDoodleDrawing(actions),
      reaction: (event) => room.receiveReaction(event),
      refused: (event) => room.receiveRefusal(event),
    },
  });

const createNameField = (room: RoomStore, t: Translate): NameFieldStore =>
  new NameFieldStore({
    read: () => room.presence.me?.name ?? '',
    write: (name) => room.rename(name),
    placeholder: () => t('people.namePlaceholder'),
    normalize: (text) => text.slice(0, personNameMaxLength),
    finish: (text) => text.trim().replace(/\s+/gu, ' '),
  });

// The table: its connection hands snapshots, tasks, pages, doodles and reactions to the parts,
// and the parts send their intents back through it.
export class RoomStore {
  readonly connection: RoomConnectionStore;
  readonly presence: RoomPresenceStore;
  readonly game: RoomGameStore;
  readonly doodle: RoomDoodleStore;
  readonly step: RoomStepStore;
  readonly books: RoomBooksStore;
  readonly reveal: RoomRevealStore;
  readonly shelf: RoomShelfStore;
  readonly feed: RoomFeedStore;
  readonly chatPace: RoomChatPaceStore;
  readonly reactions: RoomReactionsStore;
  readonly share: RoomShareStore;
  readonly myNameField: NameFieldStore;
  readonly #services: Services;
  readonly #ui: UiStore;

  constructor(services: Services, locale: LocaleStore, ui: UiStore) {
    const { t } = locale;
    const send: TableSend = (type, message) => this.connection.link?.send(type, message);
    const meId = (): string => this.presence.meId;

    this.#services = services;
    this.#ui = ui;
    this.connection = createConnection(this, services, t);
    this.presence = new RoomPresenceStore({ t });
    this.game = new RoomGameStore({ ...services, t, presence: this.presence, send, isWorking: () => this.step.state === 'working' });
    this.doodle = new RoomDoodleStore({ ...services, t, send, meId, isLobby: () => this.game.state === 'lobby' });
    this.step = new RoomStepStore({ ...services, t, send, language: () => locale.language, presence: this.presence, isStep: () => this.game.state === 'step', stepKind: () => this.game.stepKind });
    this.books = new RoomBooksStore({ ...services, t, send, game: this.game, presence: this.presence });
    this.reveal = new RoomRevealStore({ ...services, t, send, game: this.game, presence: this.presence, books: this.books });
    this.shelf = new RoomShelfStore({ t, game: this.game, presence: this.presence, books: this.books });
    this.chatPace = new RoomChatPaceStore({ t, now: services.now, schedule: services.schedule });

    this.feed = new RoomFeedStore({
      presence: this.presence,
      locale,
      send: (text) => send('chat', { text }),
      takeTurn: () => this.chatPace.take(),
      isOpen: () => ui.widgets.chat.isOpen,
    });

    this.reactions = new RoomReactionsStore({ ...services, t, send: (emoji) => send('react', { emoji }) });
    this.share = new RoomShareStore({ ...services, roomId: () => this.connection.roomId, t });
    this.myNameField = createNameField(this, t);
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isOpen(): boolean {
    return this.connection.isOpen;
  }

  // Only the demo table has these.
  get demo(): DemoControls | null {
    return this.connection.link?.demo ?? null;
  }

  // The board the keyboard shortcuts work on: the doodle board in the lobby, your page while you draw.
  get activeBoard(): RoomBoardStore | null {
    if (this.game.state === 'lobby') return this.doodle.board;

    return this.step.isDraw && this.step.canEdit ? this.step.board : null;
  }

  open(): void {
    this.connection.open();
  }

  toggleChat(): void {
    this.#ui.widgets.chat.toggle();

    if (this.#ui.widgets.chat.isOpen) this.feed.markRead();
  }

  receiveSnapshot(snapshot: TableSnapshot): void {
    const revealBefore = this.game.reveal;

    this.presence.receive(snapshot.members, this.connection.meId);
    this.game.receive(snapshot.game);
    this.doodle.receive(snapshot.game.squiggle);
    this.books.prune();
    this.reveal.cue(revealBefore);
    this.shelf.receivePhase(snapshot.game.phase);
    this.feed.receive(snapshot.feed);
  }

  receiveTask(task: TaskSnapshot | null): void {
    this.step.receiveTask(task);
  }

  receivePage(page: PageSnapshot): void {
    this.books.receivePage(page);
  }

  receiveDoodle(op: BoardOp): void {
    this.doodle.receiveOp(op);
  }

  receiveDoodleDrawing(actions: BoardAction[]): void {
    this.doodle.restore(actions);
  }

  // A chat line the table turned down for coming too fast gets a note, instead of vanishing.
  receiveRefusal(event: TableErrorEvent): void {
    if (event.type === 'chat' && event.code === 'RATE_LIMITED') this.chatPace.refuse();
  }

  receiveReaction(event: TableReactionEvent): void {
    this.reactions.receive(event.emoji, event.memberId, this.presence.find(event.memberId)?.name ?? '');
  }

  rename(name: string): void {
    const me = this.presence.me;

    if (!me) return;

    this.presence.rename(me.id, name);
    this.#services.preferences.saveName(name);
    this.connection.link?.send('rename', { name });
  }
}
