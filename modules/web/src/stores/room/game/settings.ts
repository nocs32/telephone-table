import { bookLengths, gameLimits, type BookLength, type GameSettings } from '@telephone-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../../locale';
import type { TableSend } from '../types';

export interface RoomGameSettingsDeps {
  t: Translate;
  send: TableSend;
  // Settings change only in the lobby (spec D14).
  isEditable: () => boolean;
}

// idle → dragging (a slider is held: the table's values don't overwrite it).
export type RoomGameSettingsState = 'idle' | 'dragging';

export interface BookLengthOption {
  value: string;
  label: string;
}

// The lobby's settings card (spec §5.1). Values come from the table; a slider shows where you drag
// at once and sends when you let go. Anyone at the table may change them.
export class RoomGameSettingsStore {
  state: RoomGameSettingsState = 'idle';
  rounds = 0;
  writeSeconds = 0;
  drawSeconds = 0;
  bookLength: BookLength = 'everyone';
  points = true;
  readonly limits = gameLimits;
  readonly #deps: RoomGameSettingsDeps;

  constructor(deps: RoomGameSettingsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, { limits: false }, { autoBind: true });
  }

  get isEditable(): boolean {
    return this.#deps.isEditable();
  }

  get roundsLabel(): string {
    return String(this.rounds);
  }

  get writeTimeLabel(): string {
    return this.#deps.t('lobby.seconds', { count: this.writeSeconds });
  }

  get drawTimeLabel(): string {
    return this.#deps.t('lobby.seconds', { count: this.drawSeconds });
  }

  get bookLengthOptions(): BookLengthOption[] {
    return bookLengths.map((length) => ({ value: String(length), label: length === 'everyone' ? this.#deps.t('lobby.bookEveryone') : String(length) }));
  }

  get bookLengthValue(): string {
    return String(this.bookLength);
  }

  get bookLengthHint(): string {
    return this.bookLength === 'everyone' ? this.#deps.t('lobby.bookEveryoneHint') : this.#deps.t('lobby.bookPagesHint', { count: this.bookLength });
  }

  get pointsHint(): string {
    return this.#deps.t(this.points ? 'lobby.pointsOnHint' : 'lobby.pointsOffHint');
  }

  receive(settings: GameSettings): void {
    if (this.state !== 'dragging') {
      this.rounds = settings.rounds;
      this.writeSeconds = settings.writeSeconds;
      this.drawSeconds = settings.drawSeconds;
    }

    this.bookLength = settings.bookLength;
    this.points = settings.points;
  }

  previewRounds(values: number[]): void {
    this.state = 'dragging';
    this.rounds = values[0] ?? this.rounds;
  }

  previewWriteSeconds(values: number[]): void {
    this.state = 'dragging';
    this.writeSeconds = values[0] ?? this.writeSeconds;
  }

  previewDrawSeconds(values: number[]): void {
    this.state = 'dragging';
    this.drawSeconds = values[0] ?? this.drawSeconds;
  }

  commitSliders(): void {
    this.state = 'idle';
    this.#deps.send('updateSettings', { rounds: this.rounds, writeSeconds: this.writeSeconds, drawSeconds: this.drawSeconds });
  }

  chooseBookLength(value: string | null): void {
    const length = bookLengths.find((option) => String(option) === value);

    if (length !== undefined) this.#deps.send('updateSettings', { bookLength: length });
  }

  setPoints(checked: boolean): void {
    this.#deps.send('updateSettings', { points: checked });
  }
}
