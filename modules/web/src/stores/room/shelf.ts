import type { GamePhase } from '@telephone-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../locale';
import type { BookCoverView, PageAward, PageView, RoomBooksStore } from './books';
import type { RoomGameStore } from './game';
import type { PlayerView, RoomPresenceStore } from './presence';

export type Medal = 'gold' | 'silver' | 'bronze';

export interface PodiumPlaceView {
  player: PlayerView;
  medal: Medal;
}

export interface PodiumAwardView {
  kind: PageAward;
  title: string;
  pages: PageView[];
}

export interface PodiumView {
  title: string;
  places: PodiumPlaceView[];
  others: PlayerView[];
  awards: PodiumAwardView[];
}

export interface OpenBookView {
  cover: BookCoverView;
  pages: PageView[];
}

export interface RoomShelfDeps {
  t: Translate;
  game: RoomGameStore;
  presence: RoomPresenceStore;
  books: RoomBooksStore;
}

// podium: the podium over the shelf (spec §4.7) · shelf: browsing the books. Each person closes the
// podium and opens books at their own pace, so this is never shared.
export type RoomShelfState = 'podium' | 'shelf';

const medals: readonly Medal[] = ['gold', 'silver', 'bronze'];

export interface ConfettiPiece {
  id: string;
  lane: 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7' | 'c8' | 'c9' | 'c10' | 'c11' | 'c12';
  delay: 'd1' | 'd2' | 'd3' | 'd4';
  ink: 'red' | 'yellow' | 'sky' | 'green' | 'pink' | 'violet';
}

const confettiLanes: ReadonlyArray<ConfettiPiece['lane']> = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'];
const confettiDelays: ReadonlyArray<ConfettiPiece['delay']> = ['d1', 'd3', 'd2', 'd4'];
const confettiInks: ReadonlyArray<ConfettiPiece['ink']> = ['red', 'yellow', 'sky', 'green', 'pink', 'violet'];

// Confetti over the podium: two pieces per lane, in a fixed mix of colours and delays.
export const confettiPieces: readonly ConfettiPiece[] = confettiLanes.flatMap((lane, index) =>
  [0, 1].map((second) => ({
    id: `${lane}-${second}`,
    lane,
    delay: confettiDelays[(index + second * 2) % confettiDelays.length] ?? 'd1',
    ink: confettiInks[(index * 5 + second) % confettiInks.length] ?? 'red',
  })),
);

export class RoomShelfStore {
  state: RoomShelfState = 'podium';
  openBookId: string | null = null;
  readonly #deps: RoomShelfDeps;

  constructor(deps: RoomShelfDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get showsPodium(): boolean {
    return this.#deps.game.state === 'podium' && this.state === 'podium';
  }

  get canShowPodium(): boolean {
    return this.#deps.game.state === 'podium' && this.state === 'shelf';
  }

  get podium(): PodiumView {
    const { t, presence, books, game } = this.#deps;
    const standings = presence.standings;
    const winners = standings.filter((player) => player.place === 1);
    const awardPages = (ids: readonly string[]): PageView[] => ids.flatMap((id) => books.pageViews.get(id) ?? []);

    const awards: PodiumAwardView[] = [
      { kind: 'drawing' as const, title: t('podium.bestDrawing'), pages: awardPages(game.awards?.drawing ?? []) },
      { kind: 'line' as const, title: t('podium.bestLine'), pages: awardPages(game.awards?.line ?? []) },
    ].filter((award) => award.pages.length > 0);

    return {
      title: winners.length === 1 ? t('podium.winner', { name: winners[0]?.name ?? '' }) : t('podium.tie'),
      places: standings.filter((player) => player.place <= 3).map((player) => ({ player, medal: medals[player.place - 1] ?? 'bronze' })),
      others: standings.filter((player) => player.place > 3),
      awards,
    };
  }

  get openBook(): OpenBookView | null {
    const cover = this.#deps.books.rounds.flatMap((round) => round.books).find((book) => book.id === this.openBookId);

    return cover ? { cover, pages: this.#deps.books.viewsOf(cover.id) } : null;
  }

  // A new game: the podium comes back first.
  receivePhase(phase: GamePhase): void {
    if (phase === 'podium' || phase === 'shelf') return;

    this.state = 'podium';
    this.openBookId = null;
  }

  closePodium(): void {
    this.state = 'shelf';
  }

  showPodium(): void {
    if (this.canShowPodium) this.state = 'podium';
  }

  open(bookId: string): void {
    this.openBookId = bookId;
  }

  close(): void {
    this.openBookId = null;
  }
}
