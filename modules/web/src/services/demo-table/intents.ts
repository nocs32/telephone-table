import type { BoardFill, GameSettings, StrokeBatch, TableIntents, TableIntentType } from '@telephone-table/protocol';
import type { DemoGame } from './game';

export type DemoHandlers = { [K in TableIntentType]: (memberId: string, message: TableIntents[K]) => void };

// What the referee does about the table itself; the game's own moves are on DemoGame.
export interface DemoMoves {
  start: (memberId: string) => void;
  updateSettings: (memberId: string, patch: Partial<GameSettings>) => void;
  chat: (memberId: string, text: string) => void;
  rename: (memberId: string, name: string) => void;
  doodleStroke: (memberId: string, batch: StrokeBatch) => void;
  doodleFill: (memberId: string, fill: BoardFill) => void;
  doodleUndo: (memberId: string) => void;
  doodleSquiggle: (memberId: string) => void;
  write: (memberId: string, text: string) => void;
  stroke: (memberId: string, batch: StrokeBatch) => void;
  fill: (memberId: string, fill: BoardFill) => void;
  undo: (memberId: string) => void;
  clear: (memberId: string) => void;
}

const ignore = (): void => undefined;

// Each intent and the move that answers it. Reactions matter only to other people, and at the demo
// table everyone else is a sample player. The demo sends everything as it changes, so `sync` has
// nothing to catch up on.
export const demoHandlers = (moves: DemoMoves, game: DemoGame): DemoHandlers => ({
  sync: ignore,
  start: (id) => moves.start(id),
  updateSettings: (id, patch) => moves.updateSettings(id, patch),
  chat: (id, { text }) => moves.chat(id, text),
  react: ignore,
  rename: (id, { name }) => moves.rename(id, name),
  doodleStroke: (id, batch) => moves.doodleStroke(id, batch),
  doodleFill: (id, fill) => moves.doodleFill(id, fill),
  doodleUndo: (id) => moves.doodleUndo(id),
  doodleSquiggle: (id) => moves.doodleSquiggle(id),
  draft: (id, { text }) => moves.write(id, text),
  stroke: (id, batch) => moves.stroke(id, batch),
  fill: (id, fill) => moves.fill(id, fill),
  undo: (id) => moves.undo(id),
  clear: (id) => moves.clear(id),
  done: (id) => game.done(id),
  undone: (id) => game.undone(id),
  turnPage: (id) => game.turnPage(id),
  skipReplay: (id) => game.skipReplay(id),
  favourite: (id, { pageId }) => game.favourite(id, pageId),
  nextBook: (id) => game.nextBook(id),
  like: (id, { pageId, liked }) => game.like(id, pageId, liked),
  stick: (id, { pageId, sticker, x, y }) => game.stick(id, pageId, sticker, x, y),
  peel: (id, { stickerId }) => game.peel(id, stickerId),
  startNow: () => game.startNow(),
  playAgain: () => game.playAgain(),
});
