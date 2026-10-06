import { tallyPoints } from '@telephone-table/engine';
import type { BookSnapshot, GameSnapshot, MemberSnapshot, PageSnapshot, TableSnapshot } from '@telephone-table/protocol';
import type { DemoFeed } from './feed';
import type { DemoGame } from './game';
import { toScored, type DemoBook, type DemoPage, type DemoTableState } from './types';

// A page as everyone gets it: without the demo's own note of which sketch it is.
export const toPageSnapshot = ({ id, bookId, index, kind, author, text, actions }: DemoPage): PageSnapshot => ({ id, bookId, index, kind, author, text, actions });

const toBookSnapshot = (book: DemoBook): BookSnapshot => ({
  id: book.id,
  round: book.round,
  owner: book.owner,
  pageCount: book.pages.length,
  favouritePageId: book.favouritePageId,
});

const likesRecord = (game: DemoGame): Record<string, string[]> => Object.fromEntries([...game.likes].map(([pageId, likers]) => [pageId, [...likers]]));

const membersOf = (table: DemoTableState, game: DemoGame): MemberSnapshot[] => {
  const points = tallyPoints(game.revealedPages.map(toScored), likesRecord(game), game.favourites);
  const round = game.phase === 'step' || game.phase === 'reveal' ? game.round : null;

  return table.members.map(({ id, name, color, connected }) => ({
    id,
    name,
    color,
    connected,
    points: points.get(id) ?? 0,
    seated: round?.isWorking(id) ?? false,
    done: game.phase === 'step' && (round?.done.has(id) ?? false),
  }));
};

const gameOf = (table: DemoTableState, game: DemoGame): GameSnapshot => {
  const round = game.round;

  return {
    phase: game.phase,
    settings: table.settings,
    round: game.roundNumber,
    step: game.phase === 'step' && round ? { index: round.step, count: round.pageCount, kind: round.kind } : null,
    endsAt: game.endsAt,
    reveal: game.phase === 'reveal' ? (game.reveal?.snapshot ?? null) : null,
    books: game.books.map(toBookSnapshot),
    likes: likesRecord(game),
    stickers: game.stickers.record,
    awards: game.awards,
    squiggle: table.squiggle,
  };
};

// The table as everyone sees it: who's here, the game, and the chat. No pages: those go out one
// by one as the reveal turns them.
export const snapshotFor = (table: DemoTableState, game: DemoGame, feed: DemoFeed): TableSnapshot => ({
  members: membersOf(table, game),
  game: gameOf(table, game),
  feed: feed.items,
});
