import {
  gameLimits,
  type AwardsSnapshot,
  type BookSnapshot,
  type GamePhase,
  type GameSnapshot,
  type RevealSnapshot,
  type StepKind,
  type StepSnapshot,
  type StickerSnapshot,
} from '@telephone-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Schedule, SoundsService } from '../../../services';
import type { Translate } from '../../locale';
import type { RoomPresenceStore } from '../presence';
import type { TableSend } from '../types';
import { RoomGameClockStore } from './clock';
import { RoomGameSettingsStore } from './settings';

export interface RoomGameDeps {
  t: Translate;
  presence: RoomPresenceStore;
  send: TableSend;
  now: () => number;
  repeat: Schedule;
  sounds: SoundsService;
  // You still work on your page: the clock ticks for you in its last seconds.
  isWorking: () => boolean;
}

const tickFrom = 10;

// The game as you see it: its phase (the state), the round and step, the clock, and what the
// table says about the reveal and the books. The table runs the game; this only asks.
export class RoomGameStore {
  state: GamePhase = 'lobby';
  round = 0;
  step: StepSnapshot | null = null;
  reveal: RevealSnapshot | null = null;
  books: BookSnapshot[] = [];
  likes: Record<string, string[]> = {};
  stickers: Record<string, StickerSnapshot[]> = {};
  awards: AwardsSnapshot | null = null;
  squiggle = 0;
  readonly settings: RoomGameSettingsStore;
  readonly clock: RoomGameClockStore;
  readonly #deps: RoomGameDeps;

  constructor(deps: RoomGameDeps) {
    this.#deps = deps;
    this.settings = new RoomGameSettingsStore({ t: deps.t, send: deps.send, isEditable: () => this.state === 'lobby' });
    this.clock = new RoomGameClockStore({ now: deps.now, repeat: deps.repeat, onSecond: (seconds) => this.tickSecond(seconds) });
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // Changes with every step, so screens can play their entrance again.
  get stepKey(): string {
    return this.step ? `${this.round}-${this.step.index}` : '';
  }

  get stepKind(): StepKind | null {
    return this.step?.kind ?? null;
  }

  get isEnd(): boolean {
    return this.state === 'podium' || this.state === 'shelf';
  }

  get roundLabel(): string {
    if (this.state === 'lobby') return this.#deps.t('game.lobby');

    return this.#deps.t('game.round', { round: Math.max(1, this.round), rounds: this.settings.rounds });
  }

  get stepLabel(): string {
    return this.step ? this.#deps.t('step.page', { page: this.step.index + 1, pages: this.step.count }) : '';
  }

  get timerLabel(): string {
    return this.#deps.t('game.timeLeft', { count: this.clock.secondsLeft });
  }

  // How much of the step's (or the break's) time is left, 0–1, for the clock's ring.
  get timeFraction(): number {
    const { writeSeconds, drawSeconds } = this.settings;
    const total = this.state === 'break' ? gameLimits.breakSeconds : this.step?.kind === 'draw' ? drawSeconds : writeSeconds;

    return total > 0 ? Math.min(1, this.clock.secondsLeft / total) : 0;
  }

  get missingPlayers(): number {
    return Math.max(0, gameLimits.minPlayers - this.#deps.presence.count);
  }

  get canStart(): boolean {
    return this.state === 'lobby' && this.missingPlayers === 0;
  }

  get startHint(): string {
    const { t, presence } = this.#deps;

    return this.canStart ? t('lobby.players', { count: presence.count }) : t('lobby.needPlayers', { count: this.missingPlayers });
  }

  // Between rounds: the countdown, or waiting for a third player (spec §4.7).
  get breakLabel(): string {
    const { t } = this.#deps;

    if (this.clock.isRunning) return t('break.startsIn', { round: this.round + 1, count: this.clock.secondsLeft });

    return t('break.waiting', { count: this.missingPlayers });
  }

  get canStartNow(): boolean {
    return this.state === 'break' && this.missingPlayers === 0;
  }

  receive(game: GameSnapshot): void {
    const before = { state: this.state, stepKey: this.stepKey };

    this.state = game.phase;
    this.round = game.round;
    this.step = game.step;
    this.reveal = game.reveal;
    this.books = game.books;
    this.likes = game.likes;
    this.stickers = game.stickers;
    this.awards = game.awards;
    this.squiggle = game.squiggle;
    this.settings.receive(game.settings);
    this.clock.track(game.endsAt);
    this.#cue(before);
  }

  start(): void {
    if (this.canStart) this.#deps.send('start', {});
  }

  startNow(): void {
    if (this.canStartNow) this.#deps.send('startNow', {});
  }

  playAgain(): void {
    if (this.isEnd) this.#deps.send('playAgain', {});
  }

  // A soft tick each second of the last ten, while you're still working on your page.
  tickSecond(secondsLeft: number): void {
    if (this.state === 'step' && secondsLeft > 0 && secondsLeft <= tickFrom && this.#deps.isWorking()) this.#deps.sounds.tick();
  }

  // A chime as each step starts, a fanfare as the podium appears.
  #cue(before: { state: GamePhase; stepKey: string }): void {
    if (this.state === 'step' && this.stepKey !== before.stepKey) this.#deps.sounds.chime();

    if (this.state === 'podium' && before.state !== 'podium') this.#deps.sounds.fanfare();
  }
}
