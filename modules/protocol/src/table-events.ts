import type { BoardOp } from './drawing.js';
import type { FeedItem, GameSnapshot, MemberSnapshot, PageKind, PageSnapshot, TableReactionEvent, TaskSnapshot } from './table.js';
import type { TableErrorEvent } from './table-errors.js';

// Server → client events of the live table. The web app's table client turns them back into the
// snapshots, tasks and pages the stores read, the same shapes the demo table sends (spec D19).
// Drawings travel as bytes (engine `encodeDrawing`): they're far smaller than lists of points.

// The shared part of the table, the same for everyone. `now` is the server's clock, so browsers
// can count down to `endsAt` (spec §9.4).
export interface TableViewEvent {
  now: number;
  members: MemberSnapshot[];
  game: GameSnapshot;
}

// New feed lines, or (`reset`) all of them, after joining or reconnecting.
export interface TableFeedEvent {
  reset: boolean;
  items: FeedItem[];
}

// A drawing as bytes.
export interface TableDrawingEvent {
  bytes: Uint8Array;
}

// Only for you: your page in this step (spec §9.3), null when you have none. It's sent when a step
// starts with an empty draft, and again after `sync` with the draft the table has saved (spec D11).
export interface TableTaskEvent {
  task:
    | (Omit<TaskSnapshot, 'prompt' | 'draft'> & {
        prompt: { kind: PageKind; text: string; drawing: Uint8Array } | null;
        draft: { text: string; drawing: Uint8Array };
      })
    | null;
}

export type TablePageWire = Omit<PageSnapshot, 'actions'> & { drawing: Uint8Array };

// Pages the reveal turned, for everyone (spec D10): one as it's turned, or every page turned so far
// after `sync`.
export interface TablePagesEvent {
  pages: TablePageWire[];
}

export interface TableEvents {
  view: TableViewEvent;
  feed: TableFeedEvent;
  task: TableTaskEvent;
  pages: TablePagesEvent;
  // Someone else's line on the lobby's doodle board (spec D22), as it's drawn.
  doodle: BoardOp;
  // The whole doodle board: after `sync`, and empty when a new squiggle (or round 1) wipes it.
  doodleDrawing: TableDrawingEvent;
  reaction: TableReactionEvent;
  error: TableErrorEvent;
}
