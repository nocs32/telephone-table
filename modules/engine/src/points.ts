// Points, just for fun (spec D7, §5.5): +1 to a page's author for each like, +3 for being an owner's
// favourite, adding up across rounds. They never change how the game plays.
import { gameLimits, type PageKind } from '@telephone-table/protocol';

export interface ScoredPage {
  id: string;
  authorId: string;
  kind: PageKind;
  // Nothing written or drawn: it can be liked, but it wins no award.
  empty: boolean;
}

// Page id → who likes it.
export type Likes = Readonly<Record<string, readonly string[]>>;

export interface Placed<T> {
  item: T;
  // 1-based; equal scores share a place (1, 1, 3).
  place: number;
}

// Highest score first; the order among equal scores is kept.
export const rankByScore = <T>(items: readonly T[], scoreOf: (item: T) => number): Array<Placed<T>> => {
  const sorted = [...items].sort((a, b) => scoreOf(b) - scoreOf(a));

  return sorted.map((item) => ({ item, place: 1 + sorted.filter((other) => scoreOf(other) > scoreOf(item)).length }));
};

// Likes on your own page don't count (the table refuses them anyway).
const likesOf = (page: ScoredPage, likes: Likes): number => (likes[page.id] ?? []).filter((memberId) => memberId !== page.authorId).length;

// Each author's points from every page so far. `favourites` are page ids.
export const tallyPoints = (pages: readonly ScoredPage[], likes: Likes, favourites: readonly string[]): Map<string, number> => {
  const points = new Map<string, number>();

  pages.forEach((page) => {
    const gained = likesOf(page, likes) * gameLimits.likePoints + (favourites.includes(page.id) ? gameLimits.favouritePoints : 0);

    points.set(page.authorId, (points.get(page.authorId) ?? 0) + gained);
  });

  return points;
};

// The most-liked pages of one kind; ties share. A page needs at least one like, and something on it.
const mostLiked = (pages: readonly ScoredPage[], likes: Likes): string[] => {
  const candidates = pages.filter((page) => !page.empty);
  const best = Math.max(0, ...candidates.map((page) => likesOf(page, likes)));

  return best === 0 ? [] : candidates.filter((page) => likesOf(page, likes) === best).map((page) => page.id);
};

// The podium's two awards: best drawing and best line of the whole game.
export const pickAwards = (pages: readonly ScoredPage[], likes: Likes): { drawing: string[]; line: string[] } => ({
  drawing: mostLiked(
    pages.filter((page) => page.kind === 'drawing'),
    likes,
  ),
  line: mostLiked(
    pages.filter((page) => page.kind === 'sentence'),
    likes,
  ),
});
