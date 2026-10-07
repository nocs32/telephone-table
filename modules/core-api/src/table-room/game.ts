import { applySettings, changedSettings, shuffle } from '@telephone-table/engine';
import { defaultGameSettings, gameLimits, type AwardsSnapshot, type GamePhase, type GameSettings, type PageSnapshot } from '@telephone-table/protocol';
import { limits } from '../limits.js';
import { TableRoomBooks, type TableRoomBook } from './books.js';
import { TableRoomAway } from './away.js';
import { TableRoomError } from './error.js';
import type { TableRoomFeed } from './feed.js';
import type { Schedule } from './lifecycle.js';
import { authorOf, type TableRoomMembers } from './members.js';
import { TableRoomPages } from './pages.js';
import { TableRoomPoints } from './points.js';
import { TableRoomReveal } from './reveal.js';
import { TableRoomStickers } from './stickers.js';

export interface TableRoomGameDeps {
  members: TableRoomMembers;
  feed: TableRoomFeed;
  schedule: Schedule;
  now: () => number;
  random: () => number;
  createId: () => string;
  // Round 1 started: the doodle board is wiped (spec D22).
  started: () => void;
  // The reveal turned a page: it goes to everyone now (spec D10).
  turned: (page: PageSnapshot) => void;
  // Something changed on its own (a timer ran out): everyone gets the table again.
  changed: () => void;
}

const breakMs = gameLimits.breakSeconds * 1000;

// The game's states and its clock (spec §9.2): lobby → (steps → reveal → break) × rounds, the
// last reveal going to the podium (or the shelf with points off), and Play again back to the
// lobby. Its parts own the rest: the round's books, the drafts, the reveal, points and stickers.
export class TableRoomGame {
  phase: GamePhase = 'lobby';
  settings: GameSettings = { ...defaultGameSettings };
  roundNumber = 0;
  round: TableRoomBooks | null = null;
  reveal: TableRoomReveal | null = null;
  // Every book opened this game, in reveal order.
  books: TableRoomBook[] = [];
  // When the step or the break ends, in the server's time.
  endsAt: number | null = null;
  awards: AwardsSnapshot | null = null;
  readonly pages: TableRoomPages;
  readonly points: TableRoomPoints;
  readonly stickers: TableRoomStickers;
  readonly #deps: TableRoomGameDeps;
  readonly #away: TableRoomAway;
  #cancelTimer: (() => void) | null = null;

  constructor(deps: TableRoomGameDeps) {
    this.#deps = deps;
    this.#away = new TableRoomAway({ schedule: deps.schedule, graceMs: limits.table.dropGraceMs, gone: () => this.#someoneGone() });
    this.pages = new TableRoomPages({ caps: limits.table.drawing, permit: (memberId, kind) => this.#openRound().permit(memberId, kind) });
    this.points = new TableRoomPoints({ isOn: () => this.settings.points, pages: () => this.revealedPages, favourites: () => this.favourites });
    this.stickers = new TableRoomStickers({ createId: deps.createId, isOpenPage: (pageId) => this.phase === 'reveal' && (this.reveal?.isOpenPage(pageId) ?? false) });
  }

  // Every page the reveal has turned so far this game.
  get revealedPages(): PageSnapshot[] {
    return this.books.flatMap((book) => (this.reveal && book === this.reveal.book ? this.reveal.turnedPages : book.pages));
  }

  get favourites(): string[] {
    return this.books.flatMap((book) => (book.favouritePageId ? [book.favouritePageId] : []));
  }

  // Has a seat in this round, while its steps and its reveal run.
  isSeated(memberId: string): boolean {
    return (this.phase === 'step' || this.phase === 'reveal') && (this.round?.isWorking(memberId) ?? false);
  }

  isDone(memberId: string): boolean {
    return this.phase === 'step' && (this.round?.isDone(memberId) ?? false);
  }

  start(memberId: string): void {
    const starter = this.#deps.members.get(memberId);

    if (this.phase !== 'lobby') throw new TableRoomError('WRONG_PHASE');

    if (this.#deps.members.count < gameLimits.minPlayers) throw new TableRoomError('NOT_ENOUGH_PLAYERS');

    this.#reset();
    this.#deps.feed.system(starter, { type: 'started', rounds: this.settings.rounds });
    this.#deps.started();
    this.#nextRound();
  }

  // Anyone may change the settings in the lobby (spec D14); each change gets a feed line.
  updateSettings(memberId: string, patch: Partial<GameSettings>): void {
    const author = this.#deps.members.get(memberId);

    if (this.phase !== 'lobby') throw new TableRoomError('WRONG_PHASE');

    const next = applySettings(this.settings, patch);

    changedSettings(this.settings, next).forEach((setting) => this.#deps.feed.system(author, { type: 'setting', setting, value: next[setting] }));
    this.settings = next;
  }

  // The step ends early once everyone connected is done (spec §5.4).
  done(memberId: string): void {
    const round = this.#openRound();

    round.markDone(memberId);

    if (round.allDone(this.#isHere)) this.#endStep();
  }

  undone(memberId: string): void {
    this.#openRound().markUndone(memberId);
  }

  turnPage(memberId: string): void {
    this.#openReveal().turnPage(memberId);
  }

  skipReplay(memberId: string): void {
    this.#openReveal().skipReplay(memberId);
  }

  favourite(memberId: string, pageId: string): void {
    this.#openReveal().favourite(memberId, pageId);
  }

  nextBook(memberId: string): void {
    if (!this.#openReveal().nextBook(memberId)) this.#afterReveal();
  }

  // Skips the rest of the break (spec §4.7).
  startNow(memberId: string): void {
    this.#deps.members.get(memberId);

    if (this.phase !== 'break') throw new TableRoomError('WRONG_PHASE');

    if (this.#deps.members.count < gameLimits.minPlayers) throw new TableRoomError('NOT_ENOUGH_PLAYERS');

    this.#nextRound();
  }

  // Back to the lobby with the same people; the books are gone.
  playAgain(memberId: string): void {
    this.#deps.members.get(memberId);

    if (this.phase !== 'podium' && this.phase !== 'shelf') throw new TableRoomError('WRONG_PHASE');

    this.#reset();
  }

  // Someone sat down: a break that was waiting for a third person starts its clock.
  join(): void {
    if (this.phase === 'break' && this.endsAt === null) this.#armBreak();
  }

  // A connection dropped: after a short grace it holds nobody up (spec §5.4).
  drop(memberId: string): void {
    this.#away.drop(memberId);
  }

  reconnect(memberId: string): void {
    this.#away.back(memberId);
  }

  // Someone left the table for good (spec §4.6): their page in this step goes in, their later
  // pages are skipped, and fewer than two people working skips to the reveal.
  leave(memberId: string): void {
    const round = this.round;

    this.#away.back(memberId);
    round?.leave(memberId);
    this.reveal?.ownerLeft(memberId);

    if (this.phase === 'step' && round && (round.working.length < gameLimits.minWorking || round.allDone(this.#isHere))) this.#endStep();

    if (this.phase === 'break' && this.#deps.members.count < gameLimits.minPlayers) this.#armBreak();
  }

  dispose(): void {
    this.#stopTimer();
    this.#away.dispose();
    this.reveal?.dispose();
  }

  // At the table, or only just dropped (a reload).
  readonly #isHere = (memberId: string): boolean => this.#deps.members.has(memberId) && this.#away.isHere(memberId);

  #someoneGone(): void {
    if (this.phase === 'step' && this.round?.allDone(this.#isHere)) this.#endStep();

    this.#deps.changed();
  }

  #openRound(): TableRoomBooks {
    if (this.phase !== 'step' || !this.round) throw new TableRoomError('WRONG_PHASE');

    return this.round;
  }

  #openReveal(): TableRoomReveal {
    if (this.phase !== 'reveal' || !this.reveal) throw new TableRoomError('WRONG_PHASE');

    return this.reveal;
  }

  // Seats for everyone at the table now, reshuffled, so neighbours change (spec §4.7).
  #nextRound(): void {
    const seats = shuffle(this.#deps.members.all.map(authorOf), this.#deps.random);

    this.reveal?.dispose();
    this.reveal = null;
    this.roundNumber += 1;
    this.round = new TableRoomBooks({ round: this.roundNumber, seats, length: this.settings.bookLength, createId: this.#deps.createId });
    this.#beginStep();
  }

  #beginStep(): void {
    const kind = this.round?.kind ?? 'write';
    const ms = (kind === 'write' ? this.settings.writeSeconds : this.settings.drawSeconds) * 1000;

    this.phase = 'step';
    this.pages.reset();
    this.endsAt = this.#deps.now() + ms;
    // When time runs out, stroke batches still on their way count for a moment (spec §5.4).
    this.#startTimer(ms + gameLimits.lastBatchMs, () => this.#endStep());
  }

  // Everyone's page goes in as it is (spec D8), and the books move one seat along.
  #endStep(): void {
    const round = this.round;

    if (this.phase !== 'step' || !round) return;

    round.lock((memberId) => this.pages.contentOf(memberId));
    this.pages.reset();

    if (round.isOver || round.working.length < gameLimits.minWorking) this.#beginReveal(round);
    else this.#beginStep();
  }

  #beginReveal(round: TableRoomBooks): void {
    const { now, schedule, turned, changed } = this.#deps;

    this.#stopTimer();
    this.phase = 'reveal';
    this.endsAt = null;

    this.reveal = new TableRoomReveal(round.books, {
      now,
      schedule,
      turned,
      changed,
      pointsOn: () => this.settings.points,
      isHere: this.#isHere,
      opened: (book) => this.books.push(book),
    });

    this.reveal.open();
  }

  // After the round's last book: a break before the next round, or the podium after the last.
  #afterReveal(): void {
    this.reveal = null;

    if (this.roundNumber < this.settings.rounds) {
      this.phase = 'break';
      this.#armBreak();

      return;
    }

    this.phase = this.settings.points ? 'podium' : 'shelf';
    this.awards = this.settings.points ? this.points.awards() : null;
  }

  // The next round starts by itself after the break, once at least three people are here.
  #armBreak(): void {
    const enough = this.#deps.members.count >= gameLimits.minPlayers;

    this.#stopTimer();
    this.endsAt = enough ? this.#deps.now() + breakMs : null;

    if (enough) this.#startTimer(breakMs, () => this.#nextRound());
  }

  #startTimer(ms: number, run: () => void): void {
    this.#stopTimer();

    this.#cancelTimer = this.#deps.schedule(() => {
      this.#cancelTimer = null;
      run();
      this.#deps.changed();
    }, ms);
  }

  #stopTimer(): void {
    this.#cancelTimer?.();
    this.#cancelTimer = null;
  }

  #reset(): void {
    this.#stopTimer();
    this.reveal?.dispose();
    this.pages.reset();
    this.points.reset();
    this.stickers.reset();
    Object.assign(this, { phase: 'lobby', roundNumber: 0, round: null, reveal: null, books: [], endsAt: null, awards: null });
  }
}
