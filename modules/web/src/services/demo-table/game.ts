import { pickAwards, shuffle } from '@telephone-table/engine';
import { gameLimits, type AwardsSnapshot, type GamePhase, type GameSettings, type Sticker } from '@telephone-table/protocol';
import { DemoPlans } from './plans';
import { DemoReveal } from './reveal';
import { DemoRound } from './round';
import { DemoStickers } from './stickers';
import { toScored, type DemoBook, type DemoDeps, type DemoGameState, type DemoMember, type DemoPage } from './types';

export interface DemoGameHost {
  members: () => readonly DemoMember[];
  settings: () => GameSettings;
  // Something changed: everyone gets the table again.
  emit: () => void;
  // The reveal turned a page: it goes to everyone now, and never before (spec D10).
  page: (page: DemoPage) => void;
  // A step began, or a page was turned: the sample players plan what to do.
  stepStarted: (round: DemoRound) => void;
  pageShown: (reveal: DemoReveal) => void;
}

const idleMs = gameLimits.ownerIdleSeconds * 1000;
const breakMs = gameLimits.breakSeconds * 1000;

// The game's states (spec §9.2): lobby → steps → reveal → break → … → podium (or shelf) → lobby.
// The table decides everything here; browsers only ask.
export class DemoGame implements DemoGameState {
  phase: GamePhase = 'lobby';
  roundNumber = 0;
  round: DemoRound | null = null;
  reveal: DemoReveal | null = null;
  // Every book opened this game, in reveal order.
  books: DemoBook[] = [];
  likes = new Map<string, Set<string>>();
  endsAt: number | null = null;
  awards: AwardsSnapshot | null = null;
  readonly stickers: DemoStickers;
  readonly #deps: DemoDeps;
  readonly #host: DemoGameHost;
  readonly #plans: DemoPlans<'phase' | 'idle'>;

  constructor(deps: DemoDeps, host: DemoGameHost) {
    this.#deps = deps;
    this.#host = host;
    this.#plans = new DemoPlans(deps.schedule);
    this.stickers = new DemoStickers(deps.createId);
  }

  // Every page the reveal has turned so far.
  get revealedPages(): DemoPage[] {
    return this.books.flatMap((book) => (book === this.reveal?.book ? book.pages.slice(0, this.reveal.shown) : book.pages));
  }

  get favourites(): string[] {
    return this.books.flatMap((book) => (book.favouritePageId ? [book.favouritePageId] : []));
  }

  start(): boolean {
    if (this.phase !== 'lobby' || this.#host.members().length < gameLimits.minPlayers) return false;

    this.#reset();
    this.#nextRound();

    return true;
  }

  done(memberId: string): void {
    if (this.phase !== 'step' || !this.round) return;

    this.round.markDone(memberId);

    if (this.round.allDone) this.endStep();
    else this.#host.emit();
  }

  undone(memberId: string): void {
    if (this.phase !== 'step' || !this.round) return;

    this.round.markUndone(memberId);
    this.#host.emit();
  }

  // Everyone's page goes in as it is (spec D8); the books move one seat along.
  endStep(): void {
    const round = this.round;

    if (this.phase !== 'step' || !round) return;

    round.lock();

    if (round.isOver || round.working.length < gameLimits.minWorking) this.#beginReveal(round);
    else this.#beginStep(round);
  }

  turnPage(memberId: string): void {
    const reveal = this.reveal;

    if (this.phase !== 'reveal' || !reveal?.canTurn(memberId) || reveal.isLastPage) return;

    reveal.turn(this.#deps.now());
    this.#showPage(reveal);
  }

  skipReplay(memberId: string): void {
    if (this.phase !== 'reveal' || !this.reveal?.canTurn(memberId)) return;

    this.reveal.skipped = true;
    this.#host.emit();
  }

  // The owner's favourite page in their book, by someone else (spec D7).
  favourite(memberId: string, pageId: string): void {
    const book = this.reveal?.book;
    const page = book?.pages.find((candidate) => candidate.id === pageId);

    if (!this.#host.settings().points || !book || !this.reveal?.isLastPage || book.owner.id !== memberId || !page || page.author.id === memberId) return;

    book.favouritePageId = pageId;
    this.#host.emit();
  }

  nextBook(memberId: string): void {
    const reveal = this.reveal;

    if (this.phase !== 'reveal' || !reveal?.canTurn(memberId) || !reveal.isLastPage) return;

    const needsFavourite = this.#host.settings().points && reveal.takeover === null && reveal.book?.favouritePageId === null;

    if (!needsFavourite) this.#openNextBook(reveal);
  }

  like(memberId: string, pageId: string, liked: boolean): void {
    const page = this.revealedPages.find((candidate) => candidate.id === pageId);

    if (!this.#host.settings().points || !page || page.author.id === memberId) return;

    const likers = this.likes.get(pageId) ?? new Set<string>();

    if (liked) likers.add(memberId);
    else likers.delete(memberId);

    this.likes.set(pageId, likers);
    this.#host.emit();
  }

  // Stickers go only on the open book's turned pages (spec D25).
  stick(memberId: string, pageId: string, sticker: Sticker, x: number, y: number): void {
    if (this.#isOpenPage(pageId) && this.stickers.stick(memberId, pageId, sticker, x, y)) this.#host.emit();
  }

  peel(memberId: string, stickerId: string): void {
    if (this.#isOpenPage(this.stickers.pageOf(stickerId) ?? '') && this.stickers.peel(memberId, stickerId)) this.#host.emit();
  }

  startNow(): void {
    if (this.phase === 'break' && this.#host.members().length >= gameLimits.minPlayers) this.#nextRound();
  }

  playAgain(): void {
    if (this.phase !== 'podium' && this.phase !== 'shelf') return;

    this.#reset();
    this.#host.emit();
  }

  // The demo's Skip button: whatever comes next, now.
  skip(): void {
    const reveal = this.reveal;

    if (this.phase === 'step') this.endStep();
    else if (this.phase === 'break') this.startNow();
    else if (reveal && this.phase === 'reveal' && !reveal.isLastPage) this.#forceTurn(reveal);
    else if (reveal && this.phase === 'reveal') this.#openNextBook(reveal);
  }

  joined(): void {
    if (this.phase === 'break' && this.endsAt === null) this.#armBreak();
  }

  // Someone left the table (spec §4.6).
  left(memberId: string): void {
    this.round?.leave(memberId);
    this.reveal?.ownerLeft(memberId);

    if (this.phase === 'step' && this.round && (this.round.working.length < gameLimits.minWorking || this.round.allDone)) this.endStep();

    if (this.phase === 'break' && this.#host.members().length < gameLimits.minPlayers) this.#armBreak();
  }

  dispose(): void {
    this.#plans.cancelAll();
  }

  #nextRound(): void {
    const seats = shuffle(
      this.#host.members().filter((member) => member.connected),
      this.#deps.random,
    );

    this.roundNumber += 1;
    this.reveal = null;
    this.round = new DemoRound(this.roundNumber, seats, this.#host.settings(), this.#deps.createId);
    this.#beginStep(this.round);
  }

  #beginStep(round: DemoRound): void {
    const settings = this.#host.settings();
    const ms = (round.kind === 'write' ? settings.writeSeconds : settings.drawSeconds) * 1000;

    this.phase = 'step';
    this.endsAt = this.#deps.now() + ms;
    this.#plans.cancel('phase');
    this.#plans.later('phase', ms, () => this.endStep());
    this.#host.stepStarted(round);
    this.#host.emit();
  }

  #beginReveal(round: DemoRound): void {
    const reveal = new DemoReveal(round.books, this.#deps.now(), this.#isHere(round.books[0]?.owner.id ?? ''));

    this.#plans.cancel('phase');
    this.phase = 'reveal';
    this.endsAt = null;
    this.reveal = reveal;

    if (reveal.book) this.books.push(reveal.book);

    this.#showPage(reveal);
  }

  #showPage(reveal: DemoReveal): void {
    const page = reveal.page;

    this.#plans.cancel('idle');

    this.#plans.later('idle', idleMs, () => {
      reveal.goIdle();
      this.#host.emit();
    });

    if (page) this.#host.page(page);

    this.#host.pageShown(reveal);
    this.#host.emit();
  }

  #forceTurn(reveal: DemoReveal): void {
    reveal.turn(this.#deps.now());
    this.#showPage(reveal);
  }

  #openNextBook(reveal: DemoReveal): void {
    if (!reveal.nextBook(this.#deps.now(), (ownerId) => this.#isHere(ownerId))) {
      this.#afterReveal();

      return;
    }

    if (reveal.book) this.books.push(reveal.book);

    this.#showPage(reveal);
  }

  #afterReveal(): void {
    this.#plans.cancelAll();
    this.reveal = null;

    if (this.roundNumber < this.#host.settings().rounds) {
      this.phase = 'break';
      this.#armBreak();

      return;
    }

    const { points } = this.#host.settings();

    this.phase = points ? 'podium' : 'shelf';
    this.awards = points ? pickAwards(this.revealedPages.map(toScored), Object.fromEntries([...this.likes].map(([id, set]) => [id, [...set]]))) : null;
    this.#host.emit();
  }

  // The next round starts by itself after the break, once at least three people are here.
  #armBreak(): void {
    const enough = this.#host.members().length >= gameLimits.minPlayers;

    this.#plans.cancel('phase');
    this.endsAt = enough ? this.#deps.now() + breakMs : null;

    if (enough) this.#plans.later('phase', breakMs, () => this.#nextRound());

    this.#host.emit();
  }

  #isOpenPage(pageId: string): boolean {
    const reveal = this.reveal;

    return this.phase === 'reveal' && (reveal?.book?.pages.slice(0, reveal.shown).some((page) => page.id === pageId) ?? false);
  }

  #isHere(memberId: string): boolean {
    return this.#host.members().some((member) => member.id === memberId && member.connected);
  }

  #reset(): void {
    this.#plans.cancelAll();
    this.stickers.clear();
    Object.assign(this, { phase: 'lobby', roundNumber: 0, round: null, reveal: null, books: [], likes: new Map(), endsAt: null, awards: null });
  }
}
