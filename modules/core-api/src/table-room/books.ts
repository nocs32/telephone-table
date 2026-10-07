import { bookHeldBy, bookPageCount, promptPage, stepKindAt } from '@telephone-table/engine';
import type { AuthorSnapshot, BoardAction, BookLength, PageSnapshot, StepKind } from '@telephone-table/protocol';
import { TableRoomError } from './error.js';

export interface TableRoomBook {
  id: string;
  round: number;
  owner: AuthorSnapshot;
  pages: PageSnapshot[];
  // The owner's favourite page (spec D7), once picked at the reveal.
  favouritePageId: string | null;
}

// What someone's page holds when the step ends.
export interface TableRoomPageContent {
  text: string;
  actions: BoardAction[];
}

export interface TableRoomBooksSetup {
  round: number;
  // In seat order, shuffled as the round starts (spec §4.4).
  seats: readonly AuthorSnapshot[];
  length: BookLength;
  createId: () => string;
}

// One round's seats and books (spec §4.4, §4.6): a book per seat, the step everyone is on, who holds
// which book, who pressed Done, and who left. Pages are kept here and passed on to nobody until
// the reveal (spec D10).
export class TableRoomBooks {
  readonly round: number;
  readonly seats: readonly AuthorSnapshot[];
  readonly books: readonly TableRoomBook[];
  readonly pageCount: number;
  step = 0;
  readonly #done = new Set<string>();
  // Who left, and in which step: their page in that step still goes in.
  readonly #leftAt = new Map<string, number>();
  readonly #id: string;
  readonly #createId: () => string;

  constructor({ round, seats, length, createId }: TableRoomBooksSetup) {
    this.round = round;
    this.seats = seats;
    this.pageCount = bookPageCount(seats.length, length);
    this.books = seats.map((owner) => ({ id: createId(), round, owner, pages: [], favouritePageId: null }));
    this.#id = createId();
    this.#createId = createId;
  }

  get kind(): StepKind {
    return stepKindAt(this.step);
  }

  get isOver(): boolean {
    return this.step >= this.pageCount;
  }

  // Changes every step, so browsers start a fresh page.
  get taskId(): string {
    return `${this.#id}-${this.step}`;
  }

  // Seated, and still at the table.
  get working(): string[] {
    return this.seats.filter((seat) => !this.#leftAt.has(seat.id)).map((seat) => seat.id);
  }

  isWorking(memberId: string): boolean {
    return this.working.includes(memberId);
  }

  isDone(memberId: string): boolean {
    return this.#done.has(memberId);
  }

  // Everyone still working and connected has pressed Done: a dropped connection holds nobody up.
  allDone(isConnected: (memberId: string) => boolean): boolean {
    const connected = this.working.filter(isConnected);

    return connected.length > 0 && connected.every((memberId) => this.#done.has(memberId));
  }

  // The book a member holds in this step.
  bookOf(memberId: string): TableRoomBook | null {
    const seat = this.seats.findIndex((member) => member.id === memberId);

    return seat < 0 ? null : (this.books[bookHeldBy(seat, this.step, this.seats.length)] ?? null);
  }

  // What a member responds to: the latest page of the other kind (spec §4.6). None on page one.
  promptOf(memberId: string): PageSnapshot | null {
    const book = this.bookOf(memberId);

    return book && this.step > 0 ? promptPage(book.pages, this.kind) : null;
  }

  // Throws unless this person may change their page now: their own kind of step, and not after Done.
  permit(memberId: string, kind: StepKind): void {
    if (this.isOver || this.kind !== kind || !this.isWorking(memberId)) throw new TableRoomError('NOT_YOUR_PAGE');

    if (this.#done.has(memberId)) throw new TableRoomError('ALREADY_DONE');
  }

  markDone(memberId: string): void {
    if (this.isOver || !this.isWorking(memberId)) throw new TableRoomError('NOT_YOUR_PAGE');

    this.#done.add(memberId);
  }

  markUndone(memberId: string): void {
    if (this.isOver || !this.isWorking(memberId)) throw new TableRoomError('NOT_YOUR_PAGE');

    this.#done.delete(memberId);
  }

  leave(memberId: string): void {
    if (this.seats.some((seat) => seat.id === memberId) && !this.#leftAt.has(memberId)) this.#leftAt.set(memberId, this.step);
  }

  // The step ends: every page goes in as it is (spec D8), also one from someone who left during it.
  // Then the books move one seat along.
  lock(contentOf: (memberId: string) => TableRoomPageContent): void {
    this.seats.forEach((seat, index) => {
      const leftAt = this.#leftAt.get(seat.id);
      const book = this.books[bookHeldBy(index, this.step, this.seats.length)];

      if (book && (leftAt === undefined || leftAt === this.step)) book.pages.push(this.#page(seat, book, contentOf(seat.id)));
    });

    this.step += 1;
    this.#done.clear();
  }

  #page(author: AuthorSnapshot, book: TableRoomBook, { text, actions }: TableRoomPageContent): PageSnapshot {
    const isSentence = this.kind === 'write';

    return {
      id: this.#createId(),
      bookId: book.id,
      index: book.pages.length,
      kind: isSentence ? 'sentence' : 'drawing',
      author,
      text: isSentence ? text.trim() : '',
      actions: isSentence ? [] : actions,
    };
  }
}
