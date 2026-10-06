import { bookHeldBy, bookPageCount, promptPage, stepKindAt } from '@telephone-table/engine';
import {
  pageMaxActions,
  sentenceMaxLength,
  type BoardAction,
  type BoardFill,
  type GameSettings,
  type StepKind,
  type StrokeBatch,
  type TaskSnapshot,
} from '@telephone-table/protocol';
import { authorOf, type DemoBook, type DemoDraft, type DemoMember, type DemoPage, type DemoSketchName } from './types';

const emptyDraft = (): DemoDraft => ({ text: '', actions: [], sketch: null });

// One round (spec §4.4): seats fixed as it starts, a book per seat, and the step everyone is on.
// Pages are kept here and passed on to nobody until the reveal (spec D10, D11).
export class DemoRound {
  readonly number: number;
  readonly seats: readonly DemoMember[];
  readonly books: DemoBook[];
  readonly pageCount: number;
  step = 0;
  readonly done = new Set<string>();
  readonly #id: string;
  readonly #drafts = new Map<string, DemoDraft>();
  // Who left, and in which step: their page in that step still goes in (spec §4.6).
  readonly #leftAt = new Map<string, number>();
  readonly #createId: () => string;

  constructor(number: number, seats: readonly DemoMember[], settings: GameSettings, createId: () => string) {
    this.number = number;
    this.seats = seats;
    this.pageCount = bookPageCount(seats.length, settings.bookLength);
    this.books = seats.map((member) => ({ id: createId(), round: number, owner: authorOf(member), pages: [], favouritePageId: null }));
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
  get working(): DemoMember[] {
    return this.seats.filter((member) => !this.#leftAt.has(member.id));
  }

  // Everyone still working (and connected) has pressed Done.
  get allDone(): boolean {
    const connected = this.working.filter((member) => member.connected);

    return connected.length > 0 && connected.every((member) => this.done.has(member.id));
  }

  isWorking(memberId: string): boolean {
    return this.working.some((member) => member.id === memberId);
  }

  // The book a member holds in this step.
  bookOf(memberId: string): DemoBook | null {
    const seat = this.seats.findIndex((member) => member.id === memberId);

    return seat < 0 ? null : (this.books[bookHeldBy(seat, this.step, this.seats.length)] ?? null);
  }

  // What a member responds to in this step: the latest page of the other kind (spec §4.6).
  promptOf(memberId: string): DemoPage | null {
    const book = this.bookOf(memberId);

    return book && this.step > 0 ? promptPage(book.pages, this.kind) : null;
  }

  task(memberId: string): TaskSnapshot | null {
    const book = this.bookOf(memberId);

    if (!book || !this.isWorking(memberId) || this.isOver) return null;

    const prompt = this.promptOf(memberId);
    const { text, actions } = this.draft(memberId);

    return {
      id: this.taskId,
      kind: this.kind,
      first: this.step === 0,
      ownBook: this.step > 0 && book.owner.id === memberId,
      prompt: prompt && { kind: prompt.kind, text: prompt.text, actions: prompt.actions },
      draft: { text, actions },
    };
  }

  draft(memberId: string): DemoDraft {
    const draft = this.#drafts.get(memberId) ?? emptyDraft();

    this.#drafts.set(memberId, draft);

    return draft;
  }

  // A page changes only in its own kind of step, and not after Done.
  canEdit(memberId: string, kind: StepKind): boolean {
    return !this.isOver && this.kind === kind && this.isWorking(memberId) && !this.done.has(memberId);
  }

  write(memberId: string, text: string): void {
    if (this.canEdit(memberId, 'write')) this.draft(memberId).text = text.slice(0, sentenceMaxLength);
  }

  stroke(memberId: string, batch: StrokeBatch): void {
    if (!this.canEdit(memberId, 'draw')) return;

    const { actions } = this.draft(memberId);
    const existing = actions.find((action) => action.kind === 'stroke' && action.id === batch.strokeId);

    if (existing?.kind === 'stroke') existing.points.push(...batch.points);
    else this.#add(actions, { kind: 'stroke', id: batch.strokeId, authorId: memberId, color: batch.color, size: batch.size, eraser: batch.eraser, points: [...batch.points] });
  }

  fill(memberId: string, fill: BoardFill): void {
    if (this.canEdit(memberId, 'draw')) this.#add(this.draft(memberId).actions, { kind: 'fill', authorId: memberId, ...fill });
  }

  undo(memberId: string): void {
    if (this.canEdit(memberId, 'draw')) this.draft(memberId).actions.pop();
  }

  clear(memberId: string): void {
    if (this.canEdit(memberId, 'draw')) this.draft(memberId).actions.length = 0;
  }

  // A sample player's drawing, all at once.
  sketch(memberId: string, name: DemoSketchName, actions: BoardAction[]): void {
    if (!this.canEdit(memberId, 'draw')) return;

    Object.assign(this.draft(memberId), { actions, sketch: name });
  }

  markDone(memberId: string): void {
    if (!this.isOver && this.isWorking(memberId)) this.done.add(memberId);
  }

  markUndone(memberId: string): void {
    this.done.delete(memberId);
  }

  leave(memberId: string): void {
    if (this.seats.some((member) => member.id === memberId) && !this.#leftAt.has(memberId)) this.#leftAt.set(memberId, this.step);
  }

  // The step ends: every page goes in as it is (spec D8), also one from someone who left during it.
  lock(): void {
    this.seats.forEach((member, seat) => {
      const leftAt = this.#leftAt.get(member.id);
      const book = this.books[bookHeldBy(seat, this.step, this.seats.length)];

      if (book && (leftAt === undefined || leftAt === this.step)) book.pages.push(this.#page(member, book));
    });

    this.step += 1;
    this.done.clear();
    this.#drafts.clear();
  }

  #add(actions: BoardAction[], action: BoardAction): void {
    if (actions.length < pageMaxActions) actions.push(action);
  }

  #page(member: DemoMember, book: DemoBook): DemoPage {
    const draft = this.draft(member.id);
    const isSentence = this.kind === 'write';

    return {
      id: this.#createId(),
      bookId: book.id,
      index: book.pages.length,
      kind: isSentence ? 'sentence' : 'drawing',
      author: authorOf(member),
      text: isSentence ? draft.text.trim() : '',
      actions: isSentence ? [] : draft.actions,
      sketch: isSentence ? null : draft.sketch,
    };
  }
}
