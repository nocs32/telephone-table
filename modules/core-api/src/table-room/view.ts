import { encodeDrawing } from '@telephone-table/engine';
import type { BookSnapshot, GameSnapshot, MemberSnapshot, PageSnapshot, TablePageWire, TableTaskEvent } from '@telephone-table/protocol';
import type { TableRoomBook } from './books.js';
import type { TableRoomGame } from './game.js';
import type { TableRoomMember } from './members.js';

// What the table looks like from outside (spec §9.3): the shared view everyone gets, a task only
// its own person gets, and pages only once the reveal turns them. Nothing here reads a page that
// isn't yours or turned.

export interface TableRoomView {
  members: MemberSnapshot[];
  game: GameSnapshot;
}

const toBookSnapshot = ({ id, round, owner, pages, favouritePageId }: TableRoomBook): BookSnapshot => ({
  id,
  round,
  owner,
  pageCount: pages.length,
  favouritePageId,
});

const gameOf = (game: TableRoomGame, squiggle: number): GameSnapshot => {
  const { phase, round } = game;

  return {
    phase,
    settings: game.settings,
    round: game.roundNumber,
    step: phase === 'step' && round ? { index: round.step, count: round.pageCount, kind: round.kind } : null,
    endsAt: game.endsAt,
    reveal: phase === 'reveal' ? (game.reveal?.snapshot ?? null) : null,
    books: game.books.map(toBookSnapshot),
    likes: game.points.likes,
    stickers: game.stickers.record,
    awards: game.awards,
    squiggle,
  };
};

// The same for everyone: who's here, the game, no pages.
export const tableView = (members: readonly TableRoomMember[], game: TableRoomGame, squiggle: number): TableRoomView => {
  const points = game.points.tally();

  return {
    members: members.map(({ id, name, color, connected }) => ({
      id,
      name,
      color,
      connected,
      points: points.get(id) ?? 0,
      seated: game.isSeated(id),
      done: game.isDone(id),
    })),
    game: gameOf(game, squiggle),
  };
};

// The step's task id for this person, or null when they have none (outside steps, or watching).
export const taskIdOf = (game: TableRoomGame, memberId: string): string | null => {
  const round = game.round;

  return game.phase === 'step' && round && !round.isOver && round.isWorking(memberId) ? round.taskId : null;
};

// Only for this person: the page they respond to, and their draft as the table has saved it.
export const taskOf = (game: TableRoomGame, memberId: string): TableTaskEvent['task'] => {
  const round = game.round;
  const book = round?.bookOf(memberId);

  if (!round || !book || taskIdOf(game, memberId) === null) return null;

  const prompt = round.promptOf(memberId);

  return {
    id: round.taskId,
    kind: round.kind,
    first: round.step === 0,
    ownBook: round.step > 0 && book.owner.id === memberId,
    prompt: prompt && { kind: prompt.kind, text: prompt.text, drawing: encodeDrawing(prompt.actions) },
    draft: game.pages.draftOf(memberId),
  };
};

export const toPageWire = ({ id, bookId, index, kind, author, text, actions }: PageSnapshot): TablePageWire => ({
  id,
  bookId,
  index,
  kind,
  author,
  text,
  drawing: encodeDrawing(actions),
});
