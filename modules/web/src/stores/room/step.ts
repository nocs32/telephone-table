import { sentenceMaxLength, type BoardAction, type StepKind, type TaskSnapshot } from '@telephone-table/protocol';
import { makeAutoObservable } from 'mobx';
import { starterSentences } from '../../content';
import type { Language } from '../../i18n';
import type { Schedule, SoundsService } from '../../services';
import type { Translate } from '../locale';
import { RoomBoardStore } from './board';
import type { PlayerView, RoomPresenceStore } from './presence';
import type { TableSend } from './types';

export interface RoomStepDeps {
  t: Translate;
  language: () => Language;
  send: TableSend;
  presence: RoomPresenceStore;
  // The game is in a step (otherwise there's nothing to work on), and which kind.
  isStep: () => boolean;
  stepKind: () => StepKind | null;
  sounds: SoundsService;
  random: () => number;
  now: () => number;
  createId: () => string;
  schedule: Schedule;
}

// none: no page for you (outside steps, or watching this round) · working · done (you pressed Done;
// Not done takes it back until the step ends).
export type RoomStepState = 'none' | 'working' | 'done';

// Someone with a seat this step: done, still writing or drawing, or reconnecting.
export type WorkerStatus = 'done' | 'working' | 'away';

export interface WorkerView {
  player: PlayerView;
  status: WorkerStatus;
  statusLabel: string;
}

// A sentence draft goes to the table a second after you stop typing (spec §6).
const draftDelayMs = 1000;
// Your page's strokes go out in batches this often: nobody watches live (spec §6).
const pageFlushMs = 250;

// Your page in this step (spec §4.3): the task, your sentence or drawing, and Done. Everything is
// saved to the table as you go, so a reload gives it back (spec D11).
export class RoomStepStore {
  task: TaskSnapshot | null = null;
  text = '';
  readonly board: RoomBoardStore;
  readonly #deps: RoomStepDeps;
  #sentText = '';
  #cancelDraft: (() => void) | null = null;

  constructor(deps: RoomStepDeps) {
    const { send } = deps;

    this.#deps = deps;

    this.board = new RoomBoardStore({
      ...deps,
      channel: { stroke: (batch) => send('stroke', batch), fill: (fill) => send('fill', fill), undo: () => send('undo', {}), clear: () => send('clear', {}) },
      canDraw: () => this.canEdit && this.isDraw,
      canClearAll: true,
      flushMs: pageFlushMs,
      meId: () => deps.presence.meId,
    });

    makeAutoObservable(this, { board: false }, { autoBind: true });
  }

  get state(): RoomStepState {
    if (!this.task || !this.#deps.isStep()) return 'none';

    return this.#deps.presence.me?.done ? 'done' : 'working';
  }

  get canEdit(): boolean {
    return this.state === 'working';
  }

  get isWrite(): boolean {
    return this.task?.kind === 'write';
  }

  get isDraw(): boolean {
    return this.task?.kind === 'draw';
  }

  get isFirst(): boolean {
    return this.task?.first ?? false;
  }

  // Watching this round: no seat yet (spec §4.6).
  get isWatching(): boolean {
    return this.#deps.isStep() && this.task === null;
  }

  get title(): string {
    const { t } = this.#deps;

    if (this.isDraw) return t('step.drawTitle');

    if (this.isFirst) return t('step.firstTitle');

    return this.task?.ownBook ? t('step.ownBookTitle') : t('step.describeTitle');
  }

  // The sentence to draw, or a note when nothing was written (spec §5.2).
  get sentence(): string {
    const text = this.task?.prompt?.text ?? '';

    return text || this.#deps.t('step.nothingWritten');
  }

  get isSentenceEmpty(): boolean {
    return !this.task?.prompt?.text;
  }

  // The drawing to describe; empty when it's blank or there's none.
  get drawing(): readonly BoardAction[] {
    return this.task?.prompt?.kind === 'drawing' ? this.task.prompt.actions : [];
  }

  get isDrawingBlank(): boolean {
    return this.isWrite && !this.isFirst && this.drawing.length === 0;
  }

  get placeholder(): string {
    return this.#deps.t(this.isFirst ? 'step.firstPlaceholder' : 'step.describePlaceholder');
  }

  get counter(): string {
    return `${this.text.length} / ${sentenceMaxLength}`;
  }

  get maxLength(): number {
    return sentenceMaxLength;
  }

  // Everyone with a seat, ticked when done (spec §8).
  get workers(): PlayerView[] {
    return this.#deps.presence.seated;
  }

  // Who's done, by name, for the card beside the page.
  get workerViews(): WorkerView[] {
    const { t, stepKind } = this.#deps;
    const working = t(stepKind() === 'draw' ? 'step.workerDrawing' : 'step.workerWriting');

    return this.workers.map((player) => {
      const status: WorkerStatus = player.done ? 'done' : player.status === 'reconnecting' ? 'away' : 'working';

      return { player, status, statusLabel: status === 'done' ? t('step.workerDone') : status === 'away' ? t('people.reconnecting') : working };
    });
  }

  get doneCount(): number {
    return this.workers.filter((worker) => worker.done).length;
  }

  get progressLabel(): string {
    return this.#deps.t('step.progress', { done: this.doneCount, count: this.workers.length });
  }

  get waitingLabel(): string {
    return this.#deps.t('step.waitingFor', { count: this.workers.length - this.doneCount });
  }

  receiveTask(task: TaskSnapshot | null): void {
    const isNew = task !== null && task.id !== this.task?.id;

    this.task = task;

    if (!task || !isNew) return;

    this.#cancelDraft?.();
    this.text = task.draft.text;
    this.#sentText = task.draft.text;
    this.board.load(task.id, task.draft.actions);
  }

  // One line: no line breaks.
  setText(text: string): void {
    if (!this.canEdit) return;

    this.text = text.replace(/\s*\n\s*/gu, ' ').slice(0, sentenceMaxLength);
    this.#cancelDraft?.();
    this.#cancelDraft = this.#deps.schedule(this.saveDraft, draftDelayMs);
  }

  // 🎲: a starter sentence in your language, never the one already in the box.
  suggest(): void {
    const options = starterSentences[this.#deps.language()].filter((sentence) => sentence !== this.text);
    const pick = options[Math.floor(this.#deps.random() * options.length)];

    if (pick) this.setText(pick);
  }

  saveDraft(): void {
    this.#cancelDraft?.();
    this.#cancelDraft = null;

    if (!this.isWrite || this.text === this.#sentText) return;

    this.#sentText = this.text;
    this.#deps.send('draft', { text: this.text });
  }

  // Everything you have goes out first, then Done.
  done(): void {
    if (!this.canEdit) return;

    this.saveDraft();
    this.board.release();
    this.board.flush();
    this.#deps.send('done', {});
  }

  undone(): void {
    if (this.state === 'done') this.#deps.send('undone', {});
  }
}
