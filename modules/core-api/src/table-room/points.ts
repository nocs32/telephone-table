import { pickAwards, tallyPoints, type ScoredPage } from '@telephone-table/engine';
import type { AwardsSnapshot, PageSnapshot } from '@telephone-table/protocol';
import { TableRoomError } from './error.js';

export interface TableRoomPointsDeps {
  // Points are on in the settings (spec D7).
  isOn: () => boolean;
  // Every page the reveal has turned this game.
  pages: () => readonly PageSnapshot[];
  // The owners' favourite pages, by id.
  favourites: () => readonly string[];
}

const toScored = (page: PageSnapshot): ScoredPage => ({
  id: page.id,
  authorId: page.author.id,
  kind: page.kind,
  empty: page.kind === 'sentence' ? page.text === '' : page.actions.length === 0,
});

// Likes, and the points and awards they add up to (spec §5.5): a ❤️ on any turned page but your
// own, one per person per page, and it can be taken back. Points never change how the game plays.
export class TableRoomPoints {
  #likes = new Map<string, Set<string>>();
  readonly #deps: TableRoomPointsDeps;

  constructor(deps: TableRoomPointsDeps) {
    this.#deps = deps;
  }

  // Who likes each page.
  get likes(): Record<string, string[]> {
    return Object.fromEntries([...this.#likes].filter(([, likers]) => likers.size > 0).map(([pageId, likers]) => [pageId, [...likers]]));
  }

  like(memberId: string, pageId: string, liked: boolean): void {
    const page = this.#deps.pages().find((candidate) => candidate.id === pageId);

    if (!this.#deps.isOn()) throw new TableRoomError('WRONG_PHASE');

    if (!page) throw new TableRoomError('NO_SUCH_PAGE');

    if (page.author.id === memberId) throw new TableRoomError('OWN_PAGE');

    const likers = this.#likes.get(pageId) ?? new Set<string>();

    if (liked) likers.add(memberId);
    else likers.delete(memberId);

    this.#likes.set(pageId, likers);
  }

  // Everyone's points so far this game, by member id.
  tally(): Map<string, number> {
    return tallyPoints(this.#deps.pages().map(toScored), this.likes, this.#deps.favourites());
  }

  // The podium's best drawing and best line.
  awards(): AwardsSnapshot {
    return pickAwards(this.#deps.pages().map(toScored), this.likes);
  }

  // A new game.
  reset(): void {
    this.#likes = new Map();
  }
}
