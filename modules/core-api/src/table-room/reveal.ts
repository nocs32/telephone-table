import { gameLimits, type PageSnapshot, type RevealSnapshot, type RevealTakeover } from '@telephone-table/protocol';
import type { TableRoomBook } from './books.js';
import { TableRoomError } from './error.js';
import type { Schedule } from './lifecycle.js';

export interface TableRoomRevealDeps {
  now: () => number;
  schedule: Schedule;
  pointsOn: () => boolean;
  // At the table and connected.
  isHere: (memberId: string) => boolean;
  // A book opened: the game keeps it for the shelf.
  opened: (book: TableRoomBook) => void;
  // A page was turned: it goes to everyone now, and never before (spec D10).
  turned: (page: PageSnapshot) => void;
  // Something changed on its own: the owner went idle.
  changed: () => void;
}

const idleMs = gameLimits.ownerIdleSeconds * 1000;

// A round's reveal (spec §4.5): one book at a time in seat order, page by page, turned by its
// owner. Everyone may turn once the owner has left, or once a page sat unturned for 20 seconds
// (spec D6). At the end of a book the owner picks a favourite (spec D7), then opens the next.
export class TableRoomReveal {
  readonly #books: readonly TableRoomBook[];
  #bookIndex = 0;
  #shown = 1;
  #turnedAt = 0;
  #skipped = false;
  #takeover: RevealTakeover | null = null;
  #idleAt = 0;
  #cancelIdle: (() => void) | null = null;
  readonly #deps: TableRoomRevealDeps;

  constructor(books: readonly TableRoomBook[], deps: TableRoomRevealDeps) {
    this.#books = books;
    this.#deps = deps;
  }

  get book(): TableRoomBook | undefined {
    return this.#books[this.#bookIndex];
  }

  get isLastPage(): boolean {
    return this.#shown >= (this.book?.pages.length ?? 0);
  }

  // The open book's pages turned so far.
  get turnedPages(): PageSnapshot[] {
    return this.book?.pages.slice(0, this.#shown) ?? [];
  }

  get snapshot(): RevealSnapshot | null {
    const book = this.book;

    if (!book) return null;

    return {
      bookId: book.id,
      bookIndex: this.#bookIndex,
      bookCount: this.#books.length,
      shown: this.#shown,
      turnedAt: this.#turnedAt,
      skipped: this.#skipped,
      takeover: this.#takeover,
      idleAt: this.#idleAt,
    };
  }

  // Opens the first book on its first page.
  open(): void {
    this.#openBook();
  }

  isOpenPage(pageId: string): boolean {
    return this.turnedPages.some((page) => page.id === pageId);
  }

  turnPage(memberId: string): void {
    this.#permit(memberId);

    if (this.isLastPage) throw new TableRoomError('NO_SUCH_PAGE');

    this.#shown += 1;
    this.#showPage();
  }

  // The latest drawing jumps to the finished picture.
  skipReplay(memberId: string): void {
    this.#permit(memberId);
    this.#skipped = true;
  }

  favourite(memberId: string, pageId: string): void {
    const book = this.book;
    const page = book?.pages.find((candidate) => candidate.id === pageId);

    if (!this.#deps.pointsOn() || !this.isLastPage) throw new TableRoomError('WRONG_PHASE');

    if (book?.owner.id !== memberId) throw new TableRoomError('NOT_BOOK_OWNER');

    if (!page) throw new TableRoomError('NO_SUCH_PAGE');

    if (page.author.id === memberId) throw new TableRoomError('OWN_PAGE');

    book.favouritePageId = pageId;
  }

  // Opens the next book; returns false after the last one. The owner picks a favourite first,
  // unless someone took over.
  nextBook(memberId: string): boolean {
    const needsFavourite = this.#deps.pointsOn() && this.#takeover === null && this.book?.favouritePageId === null;

    this.#permit(memberId);

    if (!this.isLastPage || needsFavourite) throw new TableRoomError('WRONG_PHASE');

    if (this.#bookIndex >= this.#books.length - 1) {
      this.dispose();

      return false;
    }

    this.#bookIndex += 1;
    this.#openBook();

    return true;
  }

  ownerLeft(memberId: string): void {
    if (memberId === this.book?.owner.id) this.#takeover = 'left';
  }

  dispose(): void {
    this.#cancelIdle?.();
    this.#cancelIdle = null;
  }

  // The owner, or anyone after the takeover.
  #permit(memberId: string): void {
    if (this.#takeover === null && memberId !== this.book?.owner.id) throw new TableRoomError('NOT_BOOK_OWNER');
  }

  #openBook(): void {
    const book = this.book;

    if (!book) return;

    this.#shown = 1;
    this.#takeover = this.#deps.isHere(book.owner.id) ? null : 'left';
    this.#deps.opened(book);
    this.#showPage();
  }

  #showPage(): void {
    const page = this.book?.pages[this.#shown - 1];

    this.#turnedAt = this.#deps.now();
    this.#idleAt = this.#turnedAt + idleMs;
    this.#skipped = false;
    this.#cancelIdle?.();
    this.#cancelIdle = this.#deps.schedule(() => this.#goIdle(), idleMs);

    if (page) this.#deps.turned(page);
  }

  // Nobody turned a page in time: everyone gets the buttons for the rest of this book.
  #goIdle(): void {
    this.#cancelIdle = null;

    if (this.#takeover !== null) return;

    this.#takeover = 'idle';
    this.#deps.changed();
  }
}
