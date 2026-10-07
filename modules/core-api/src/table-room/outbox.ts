import type { TableEvents, TablePageWire, TableTaskEvent } from '@telephone-table/protocol';
import type { TableRoomFeed } from './feed.js';
import type { TableRoomView } from './view.js';

type TableRoomOutboxSend = <K extends keyof TableEvents>(memberId: string, type: K, message: TableEvents[K]) => void;

export interface TableRoomOutboxDeps {
  feed: TableRoomFeed;
  // The shared part of the table, the same for everyone.
  view: () => TableRoomView;
  // Cheap to ask: a task is built (drawings and all) only when its id changed.
  taskIdFor: (memberId: string) => string | null;
  taskFor: (memberId: string) => TableTaskEvent['task'];
  // Every page the reveal has turned so far.
  pages: () => TablePageWire[];
  doodle: () => Uint8Array;
  now: () => number;
  send: TableRoomOutboxSend;
  broadcast: <K extends keyof TableEvents>(type: K, message: TableEvents[K]) => void;
}

// What one browser has been sent so far.
interface TableRoomOutboxSeen {
  feedSeq: number;
  taskId: string | null;
}

// What goes out after every change (spec §9.3): the shared view to everyone when it changed, and
// to each browser the feed lines it hasn't had and its task when a new one starts. A browser gets
// nothing personal until it asks with `sync`, so it's listening by then.
export class TableRoomOutbox {
  #view = '';
  readonly #seen = new Map<string, TableRoomOutboxSeen>();
  readonly #deps: TableRoomOutboxDeps;

  constructor(deps: TableRoomOutboxDeps) {
    this.#deps = deps;
  }

  // Everything again, for a browser that just joined or reconnected: the table, the chat, its
  // task and draft, the pages turned so far and the doodle board.
  sync(memberId: string): void {
    const { feed, send } = this.#deps;
    const pages = this.#deps.pages();

    send(memberId, 'view', { now: this.#deps.now(), ...this.#deps.view() });
    send(memberId, 'feed', { reset: true, items: feed.items });
    send(memberId, 'task', { task: this.#deps.taskFor(memberId) });

    if (pages.length > 0) send(memberId, 'pages', { pages });

    send(memberId, 'doodleDrawing', { bytes: this.#deps.doodle() });
    this.#seen.set(memberId, { feedSeq: feed.seq, taskId: this.#deps.taskIdFor(memberId) });
  }

  // Their connection dropped or they left: nothing personal until they sync again.
  forget(memberId: string): void {
    this.#seen.delete(memberId);
  }

  flush(): void {
    const view = this.#deps.view();
    const text = JSON.stringify(view);

    if (text !== this.#view) {
      this.#view = text;
      this.#deps.broadcast('view', { now: this.#deps.now(), ...view });
    }

    this.#seen.forEach((seen, memberId) => this.#flushPersonal(memberId, seen));
  }

  dispose(): void {
    this.#seen.clear();
  }

  #flushPersonal(memberId: string, seen: TableRoomOutboxSeen): void {
    const { feed, send } = this.#deps;
    const items = feed.since(seen.feedSeq);
    const taskId = this.#deps.taskIdFor(memberId);

    if (items.length > 0) send(memberId, 'feed', { reset: false, items });

    if (taskId !== seen.taskId) send(memberId, 'task', { task: this.#deps.taskFor(memberId) });

    this.#seen.set(memberId, { feedSeq: feed.seq, taskId });
  }
}
