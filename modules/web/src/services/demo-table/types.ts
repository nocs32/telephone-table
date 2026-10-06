import type { ScoredPage } from '@telephone-table/engine';
import type {
  AuthorSnapshot,
  AwardsSnapshot,
  BoardAction,
  GamePhase,
  GameSettings,
  PageSnapshot,
  PlayerColor,
} from '@telephone-table/protocol';
import type { Schedule } from '../types';

export interface DemoDeps {
  schedule: Schedule;
  random: () => number;
  now: () => number;
  createId: () => string;
}

// The language a sample player writes and chats in.
export type DemoLanguage = 'en' | 'uk';

export interface DemoMember {
  id: string;
  name: string;
  color: PlayerColor;
  connected: boolean;
  isBot: boolean;
  language: DemoLanguage;
}

export const demoSketchNames = [
  'snowman',
  'rainbow',
  'balloon',
  'glasses',
  'lollipop',
  'sailboat',
  'cactus',
  'candle',
  'mushroom',
  'ladder',
  'kite',
  'dice',
] as const;

export type DemoSketchName = (typeof demoSketchNames)[number];

export type DemoSketchStep = { kind: 'stroke'; color: number; size: number; points: number[] } | { kind: 'fill'; x: number; y: number; color: number };

// A page as the demo keeps it: what the reveal shows, plus (for a sample player's drawing) which
// sketch it is, so the next sample player can describe it.
export interface DemoPage extends PageSnapshot {
  sketch: DemoSketchName | null;
}

export interface DemoBook {
  id: string;
  round: number;
  owner: AuthorSnapshot;
  pages: DemoPage[];
  favouritePageId: string | null;
}

// Your page so far, and for a sample player's drawing, which sketch it is.
export interface DemoDraft {
  text: string;
  actions: BoardAction[];
  sketch: DemoSketchName | null;
}

export const authorOf = (member: DemoMember): AuthorSnapshot => ({ id: member.id, name: member.name, color: member.color });

// The parts of the game that the views read.
export interface DemoGameState {
  readonly phase: GamePhase;
  readonly roundNumber: number;
  readonly endsAt: number | null;
  readonly books: readonly DemoBook[];
  readonly likes: ReadonlyMap<string, ReadonlySet<string>>;
  readonly awards: AwardsSnapshot | null;
}

export interface DemoTableState {
  readonly members: readonly DemoMember[];
  readonly settings: GameSettings;
  readonly squiggle: number;
}

// Nothing written, or nothing drawn.
export const isEmptyPage = (page: DemoPage): boolean => (page.kind === 'sentence' ? page.text === '' : page.actions.length === 0);

// A page as the points tally reads it (engine `tallyPoints`, `pickAwards`).
export const toScored = (page: DemoPage): ScoredPage => ({ id: page.id, authorId: page.author.id, kind: page.kind, empty: isEmptyPage(page) });
