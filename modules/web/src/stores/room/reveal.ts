import type { BookSnapshot, RevealSnapshot } from '@telephone-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { SoundsService } from '../../services';
import type { Translate } from '../locale';
import type { AuthorView, PageView, RoomBooksStore } from './books';
import type { RoomGameStore } from './game';
import type { RoomPresenceStore } from './presence';
import type { TableSend } from './types';

export interface RevealPageView extends PageView {
  // The latest page replays from this moment: a drawing as a time-lapse (spec §6), a sentence typing
  // itself out. null shows it finished.
  replayFrom: number | null;
  // Whoever may turn the pages can tap the drawing to skip to the finished picture.
  canSkip: boolean;
  canPickFavourite: boolean;
}

export interface RoomRevealDeps {
  t: Translate;
  game: RoomGameStore;
  presence: RoomPresenceStore;
  books: RoomBooksStore;
  send: TableSend;
  sounds: SoundsService;
}

// The reveal as you see it (spec §4.5): the open book as a thread of the pages turned so far, and
// the buttons, for the owner (or for everyone once they've left or gone quiet).
export class RoomRevealStore {
  readonly #deps: RoomRevealDeps;

  constructor(deps: RoomRevealDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get snapshot(): RevealSnapshot | null {
    return this.#deps.game.state === 'reveal' ? this.#deps.game.reveal : null;
  }

  get book(): BookSnapshot | undefined {
    return this.#deps.books.books.get(this.snapshot?.bookId ?? '');
  }

  get owner(): AuthorView {
    const owner = this.book?.owner;
    const name = this.#deps.presence.find(owner?.id ?? '')?.name ?? owner?.name ?? '';

    return { name, initial: name.charAt(0).toUpperCase(), color: owner?.color ?? 'indigo' };
  }

  get isOwner(): boolean {
    return this.book?.owner.id === this.#deps.presence.meId;
  }

  get canTurn(): boolean {
    return this.isOwner || (this.snapshot?.takeover ?? null) !== null;
  }

  get isLastPage(): boolean {
    return (this.snapshot?.shown ?? 0) >= (this.book?.pageCount ?? 0);
  }

  get isLastBook(): boolean {
    const snapshot = this.snapshot;

    return snapshot !== null && snapshot.bookIndex >= snapshot.bookCount - 1;
  }

  // The owner picks a favourite page by someone else before the next book (spec D7).
  get needsFavourite(): boolean {
    return this.#deps.game.settings.points && this.isLastPage && this.snapshot?.takeover === null && this.book?.favouritePageId === null;
  }

  get isPickingFavourite(): boolean {
    return this.needsFavourite && this.isOwner;
  }

  get canNextBook(): boolean {
    return this.canTurn && this.isLastPage && !this.needsFavourite;
  }

  get pages(): RevealPageView[] {
    const snapshot = this.snapshot;

    if (!snapshot) return [];

    const views = this.#deps.books.viewsOf(snapshot.bookId, snapshot.shown);

    return views.map((view, index) => {
      const isLatest = index === views.length - 1 && !view.isEmpty;
      const isLatestDrawing = isLatest && view.kind === 'drawing';

      return {
        ...view,
        replayFrom: isLatest && !snapshot.skipped ? snapshot.turnedAt : null,
        canSkip: isLatestDrawing && !snapshot.skipped && this.canTurn,
        canPickFavourite: this.isPickingFavourite && !view.isMine,
      };
    });
  }

  get title(): string {
    return this.#deps.t('reveal.title', { name: this.owner.name });
  }

  get counter(): string {
    const snapshot = this.snapshot;

    return snapshot ? this.#deps.t('reveal.counter', { book: snapshot.bookIndex + 1, books: snapshot.bookCount }) : '';
  }

  // What's going on, in a line under the buttons.
  get status(): string {
    const { t } = this.#deps;
    const takeover = this.snapshot?.takeover ?? null;
    const name = this.owner.name;

    if (takeover === 'left') return t('reveal.ownerLeft', { name });

    if (!this.isOwner) return takeover === 'idle' ? t('reveal.ownerIdle', { name }) : t('reveal.showing', { name });

    if (this.isPickingFavourite) return t('reveal.pickFavourite');

    return this.isLastPage ? t('reveal.ownerLast') : t('reveal.ownerTurn');
  }

  // "Tap the drawing to skip ahead", while the newest drawing replays for whoever may skip it.
  get showsSkipHint(): boolean {
    return this.pages.at(-1)?.canSkip ?? false;
  }

  // Hearts explain themselves (spec D23).
  get likeHint(): string {
    return this.#deps.game.settings.points ? this.#deps.t('reveal.likeHint') : '';
  }

  get nextBookLabel(): string {
    return this.#deps.t(this.isLastBook ? 'reveal.finish' : 'reveal.nextBook');
  }

  turnPage(): void {
    if (this.canTurn && !this.isLastPage) this.#deps.send('turnPage', {});
  }

  skipReplay(): void {
    if (this.canTurn) this.#deps.send('skipReplay', {});
  }

  pickFavourite(pageId: string): void {
    if (this.isPickingFavourite) this.#deps.send('favourite', { pageId });
  }

  nextBook(): void {
    if (this.canNextBook) this.#deps.send('nextBook', {});
  }

  // A page turned (or a book opened) since the last snapshot: the page-turn sound.
  cue(before: RevealSnapshot | null): void {
    const now = this.snapshot;

    if (now && (now.bookId !== before?.bookId || now.shown > before.shown)) this.#deps.sounds.pageTurn();
  }
}
