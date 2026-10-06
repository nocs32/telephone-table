import type { BoardAction } from './drawing.js';
import type { GamePhase, GameSettingKey, GameSettings, StepKind } from './game.js';
import type { PlayerColor } from './players.js';
import type { StickerSnapshot } from './stickers.js';

// What a table looks like to one person. The web app's stores read only these shapes, so the demo
// referee and the real server are interchangeable behind them (spec D19). Nobody gets anyone
// else's page before the reveal turns it (spec D10): there's no shape here that could carry one.

export interface MemberSnapshot {
  id: string;
  name: string;
  color: PlayerColor;
  connected: boolean;
  points: number;
  // Has a seat this round. Newcomers watch until the next round starts (spec §4.6).
  seated: boolean;
  // Pressed Done in the current step.
  done: boolean;
}

export interface StepSnapshot {
  // 0-based within the round.
  index: number;
  count: number;
  kind: StepKind;
}

export type PageKind = 'sentence' | 'drawing';

// Who made something, kept as they were, for when they've left the table.
export interface AuthorSnapshot {
  id: string;
  name: string;
  color: PlayerColor;
}

// A page of a book, sent to everyone at the moment the reveal turns it.
export interface PageSnapshot {
  id: string;
  bookId: string;
  // 0-based place in its book.
  index: number;
  kind: PageKind;
  author: AuthorSnapshot;
  // The sentence ('' when nothing was written); '' on a drawing.
  text: string;
  // The drawing ([] when nothing was drawn); [] on a sentence.
  actions: BoardAction[];
}

// A book the reveal has opened: the shelf lists these.
export interface BookSnapshot {
  id: string;
  round: number;
  owner: AuthorSnapshot;
  pageCount: number;
  // The page the owner picked as their favourite (spec D7), once they have.
  favouritePageId: string | null;
}

// Why everyone may turn the pages: the owner left, or a page sat unturned too long (spec D6).
export type RevealTakeover = 'left' | 'idle';

export interface RevealSnapshot {
  bookId: string;
  // 0-based, in seat order.
  bookIndex: number;
  bookCount: number;
  // Pages turned so far: 1 as a book opens.
  shown: number;
  // When the latest page was turned: its drawing's time-lapse runs from here.
  turnedAt: number;
  // The latest drawing jumped to the finished picture.
  skipped: boolean;
  takeover: RevealTakeover | null;
  // When everyone gets the buttons if nobody turns a page by then.
  idleAt: number;
}

export interface AwardsSnapshot {
  // Page ids of the most-liked drawing and sentence of the game; ties share (spec §5.5).
  drawing: string[];
  line: string[];
}

export interface GameSnapshot {
  phase: GamePhase;
  settings: GameSettings;
  // 1-based; 0 in the lobby.
  round: number;
  step: StepSnapshot | null;
  // When the current step or break ends, in this browser's time.
  endsAt: number | null;
  reveal: RevealSnapshot | null;
  // Every book opened so far this game, in reveal order.
  books: BookSnapshot[];
  // Who likes each turned page: page id → member ids.
  likes: Record<string, string[]>;
  // The stickers on each turned page, oldest first (spec D25).
  stickers: Record<string, StickerSnapshot[]>;
  awards: AwardsSnapshot | null;
  // The lobby doodle board's squiggle (spec D22): every browser draws the same one from it.
  squiggle: number;
}

// What a system line says. Kept as data, so each viewer reads it in their own language.
export type FeedEvent =
  | { type: 'joined' }
  | { type: 'left' }
  | { type: 'renamed'; name: string }
  | { type: 'started'; rounds: number }
  | { type: 'setting'; setting: GameSettingKey; value: number | boolean | string }
  | { type: 'squiggle' };

interface FeedItemBase {
  id: string;
  authorId: string;
  // Their latest name and their colour, kept for when they're no longer at the table.
  authorName: string;
  authorColor: PlayerColor;
  at: number;
}

export type FeedItem = (FeedItemBase & { kind: 'message'; text: string }) | (FeedItemBase & { kind: 'system'; event: FeedEvent });

export interface TableSnapshot {
  members: MemberSnapshot[];
  game: GameSnapshot;
  feed: FeedItem[];
}

// What a task shows you: the sentence to draw, or the drawing to describe. Without its author:
// you see only the page.
export interface TaskPrompt {
  kind: PageKind;
  text: string;
  actions: BoardAction[];
}

// Your page so far, as the table has saved it (spec D11).
export interface TaskDraft {
  text: string;
  actions: BoardAction[];
}

// Only for you: the page you work on in this step.
export interface TaskSnapshot {
  // Changes every step, so the browser starts a fresh page.
  id: string;
  kind: StepKind;
  // Page one: a sentence of your own.
  first: boolean;
  // The last page of your own book (spec D9).
  ownBook: boolean;
  // null on page one, and for a writer whose book has no drawing yet (someone left).
  prompt: TaskPrompt | null;
  draft: TaskDraft;
}

export interface TableReactionEvent {
  memberId: string;
  emoji: string;
}

// Feed lines a table keeps (and a browser shows); the oldest go first.
export const feedMaxItems = 200;
