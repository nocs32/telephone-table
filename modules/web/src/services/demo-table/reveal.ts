import { gameLimits, type RevealSnapshot, type RevealTakeover } from '@telephone-table/protocol';
import type { DemoBook, DemoPage } from './types';

const idleMs = gameLimits.ownerIdleSeconds * 1000;

// A round's reveal (spec §4.5): one book at a time in seat order, page by page, turned by its owner.
// Everyone may turn once the owner has left, or once a page sat unturned for 20 seconds (spec D6).
export class DemoReveal {
  readonly books: readonly DemoBook[];
  bookIndex = 0;
  shown = 1;
  turnedAt: number;
  skipped = false;
  takeover: RevealTakeover | null = null;
  idleAt: number;

  constructor(books: readonly DemoBook[], now: number, ownerHere: boolean) {
    this.books = books;
    this.turnedAt = now;
    this.idleAt = now + idleMs;
    this.takeover = ownerHere ? null : 'left';
  }

  get book(): DemoBook | undefined {
    return this.books[this.bookIndex];
  }

  get page(): DemoPage | undefined {
    return this.book?.pages[this.shown - 1];
  }

  get isLastPage(): boolean {
    return this.shown >= (this.book?.pages.length ?? 0);
  }

  get isLastBook(): boolean {
    return this.bookIndex >= this.books.length - 1;
  }

  get snapshot(): RevealSnapshot | null {
    const { book } = this;

    if (!book) return null;

    const { bookIndex, shown, turnedAt, skipped, takeover, idleAt } = this;

    return { bookId: book.id, bookIndex, bookCount: this.books.length, shown, turnedAt, skipped, takeover, idleAt };
  }

  // The owner, or anyone after the takeover.
  canTurn(memberId: string): boolean {
    return this.takeover !== null || memberId === this.book?.owner.id;
  }

  turn(now: number): void {
    if (this.isLastPage) return;

    this.shown += 1;
    this.#restart(now);
  }

  // Opens the next book; returns false after the last one.
  nextBook(now: number, ownerHere: (ownerId: string) => boolean): boolean {
    if (this.isLastBook) return false;

    this.bookIndex += 1;
    this.shown = 1;
    this.takeover = ownerHere(this.book?.owner.id ?? '') ? null : 'left';
    this.#restart(now);

    return true;
  }

  // Nobody turned a page in time: everyone gets the buttons for the rest of this book.
  goIdle(): void {
    this.takeover ??= 'idle';
  }

  ownerLeft(ownerId: string): void {
    if (ownerId === this.book?.owner.id) this.takeover = 'left';
  }

  #restart(now: number): void {
    this.turnedAt = now;
    this.skipped = false;
    this.idleAt = now + idleMs;
  }
}
