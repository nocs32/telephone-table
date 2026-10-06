import { boardHeight, boardWidth, brushSizes, inkColors, type BoardFill, type BoardOp, type BoardTool, type InkColor, type StrokeBatch } from '@telephone-table/protocol';
import { makeAutoObservable, observableShallow } from 'mobx';
import type { Schedule, SoundsService } from '../../services';
import type { Translate } from '../locale';
import type { BoardAction, StrokeAction } from './types';

export interface ToolView {
  tool: BoardTool;
  label: string;
  isSelected: boolean;
}

export interface ColorView {
  index: number;
  name: InkColor;
  label: string;
  isSelected: boolean;
}

export type SizeDot = 'xs' | 'sm' | 'md' | 'lg';

export interface SizeView {
  index: number;
  label: string;
  isSelected: boolean;
  // How big the dot on its button is.
  dot: SizeDot;
}

// Where your lines go: the lobby's doodle board (live, to everyone) or your page (saved, to nobody).
export interface RoomBoardChannel {
  stroke: (batch: StrokeBatch) => void;
  fill: (fill: BoardFill) => void;
  undo: () => void;
  clear: () => void;
}

export interface RoomBoardDeps {
  t: Translate;
  channel: RoomBoardChannel;
  // Whether you may draw on it now.
  canDraw: () => boolean;
  // A page can be cleared; the shared doodle board can't (a new squiggle wipes it instead).
  canClearAll: boolean;
  // Your stroke goes out this often: often on the live doodle board, less on a saved page (spec §6).
  flushMs: number;
  meId: () => string;
  sounds: SoundsService;
  now: () => number;
  createId: () => string;
  schedule: Schedule;
}

// idle ⇄ stroking (your pointer is down on the board).
export type RoomBoardState = 'idle' | 'stroking';

export type BoardCursor = 'none' | 'brush' | 'fill';

const tools: readonly BoardTool[] = ['brush', 'eraser', 'fill'];
const sizeDots: readonly SizeDot[] = ['xs', 'sm', 'md', 'lg'];
const toolKeys: Readonly<Record<string, BoardTool>> = { b: 'brush', e: 'eraser', f: 'fill' };

// Board units between two recorded points.
const minStep = 1.5;
// The longest gap between two of your points that still counts as one movement, for the sound.
const maxGapMs = 80;

const half = (value: number): number => Math.round(value * 2) / 2;

const clamp = (value: number, high: number): number => half(Math.min(high, Math.max(0, value)));

// One drawing board: what's on it (strokes and fills, over a `base` nobody can undo, like the
// lobby's squiggle), your tool, colour and size, and your strokes going out. `revision` changes when
// something is taken away (undo, clear, a new page), so the canvas starts over; `version` changes
// with every new point.
export class RoomBoardStore {
  state: RoomBoardState = 'idle';
  base: BoardAction[] = [];
  actions: BoardAction[] = [];
  revision = 0;
  version = 0;
  tool: BoardTool = 'brush';
  color = inkColors.indexOf('black');
  size = 1;
  readonly #deps: RoomBoardDeps;
  #key = '';
  #live: StrokeAction | null = null;
  // Points of your current stroke already sent.
  #sent = 0;
  #lastPointAt = 0;
  #cancelFlush: (() => void) | null = null;

  constructor(deps: RoomBoardDeps) {
    this.#deps = deps;
    makeAutoObservable(this, { base: observableShallow, actions: observableShallow }, { autoBind: true });
  }

  get canDraw(): boolean {
    return this.#deps.canDraw();
  }

  get canClearAll(): boolean {
    return this.#deps.canClearAll;
  }

  get isEmpty(): boolean {
    return this.actions.length === 0;
  }

  // What the canvas paints. It carries `version`, so the painter runs again on every new point.
  get drawing(): { actions: readonly BoardAction[]; revision: number; version: number } {
    return { actions: [...this.base, ...this.actions], revision: this.revision, version: this.version };
  }

  get cursor(): BoardCursor {
    if (!this.canDraw) return 'none';

    return this.tool === 'fill' ? 'fill' : 'brush';
  }

  get toolViews(): ToolView[] {
    return tools.map((tool) => ({ tool, label: this.#deps.t(`board.${tool}`), isSelected: tool === this.tool }));
  }

  get colorViews(): ColorView[] {
    return inkColors.map((name, index) => ({ index, name, label: this.#deps.t(`ink.${name}`), isSelected: index === this.color }));
  }

  get sizeViews(): SizeView[] {
    return brushSizes.map((_, index) => ({ index, label: this.#deps.t('board.size', { number: index + 1 }), isSelected: index === this.size, dot: sizeDots[index] ?? 'lg' }));
  }

  // Undo takes back your own lines only.
  get canUndo(): boolean {
    return this.canDraw && this.actions.some((action) => action.authorId === this.#deps.meId());
  }

  get canClear(): boolean {
    return this.canDraw && this.canClearAll && this.actions.length > 0;
  }

  selectTool(tool: BoardTool): void {
    this.tool = tool;
  }

  selectColor(index: number): void {
    this.color = index;

    if (this.tool === 'eraser') this.tool = 'brush';
  }

  selectSize(index: number): void {
    this.size = index;

    if (this.tool === 'fill') this.tool = 'brush';
  }

  // Pointer down at (x, y), in board units: a fill, or the start of a stroke.
  press(x: number, y: number): void {
    if (!this.canDraw || this.state !== 'idle') return;

    const [px, py] = [clamp(x, boardWidth), clamp(y, boardHeight)];
    const authorId = this.#deps.meId();

    if (this.tool === 'fill') {
      const fill = { id: this.#deps.createId(), x: px, y: py, color: this.color };

      this.actions.push({ kind: 'fill', authorId, ...fill });
      this.version += 1;
      this.#deps.channel.fill(fill);
      this.#deps.sounds.spray();

      return;
    }

    this.#live = { kind: 'stroke', id: this.#deps.createId(), authorId, color: this.color, size: this.size, eraser: this.tool === 'eraser', points: [px, py] };
    this.#sent = 0;
    this.#lastPointAt = this.#deps.now();
    this.actions.push(this.#live);
    this.state = 'stroking';
    this.version += 1;
    this.#scheduleFlush();
  }

  drag(x: number, y: number): void {
    const live = this.#live;

    if (this.state !== 'stroking' || !live) return;

    const [px, py] = [clamp(x, boardWidth), clamp(y, boardHeight)];
    const [lastX, lastY] = live.points.slice(-2);
    const step = Math.hypot(px - (lastX ?? px), py - (lastY ?? py));
    const now = this.#deps.now();

    if (step < minStep) return;

    live.points.push(px, py);
    this.version += 1;
    this.#scheduleFlush();
    this.#deps.sounds.scratch(live.eraser, step, Math.min(maxGapMs, now - this.#lastPointAt));
    this.#lastPointAt = now;
  }

  // Letting go, wherever it happens, ends the stroke (spec §6).
  release(): void {
    if (this.state !== 'stroking') return;

    this.flush();
    this.#live = null;
    this.state = 'idle';
  }

  // Sends the points of your stroke that haven't gone out yet.
  flush(): void {
    const live = this.#live;

    this.#cancelFlush?.();
    this.#cancelFlush = null;

    if (!live || live.points.length <= this.#sent) return;

    const batch: StrokeBatch = { strokeId: live.id, color: live.color, size: live.size, eraser: live.eraser, points: live.points.slice(this.#sent) };

    this.#sent = live.points.length;
    this.#deps.channel.stroke(batch);
  }

  // Takes back your own last line or fill.
  undo(): void {
    const meId = this.#deps.meId();
    const index = this.actions.findLastIndex((action) => action.authorId === meId);

    if (!this.canUndo || index < 0) return;

    this.release();
    this.#replace(this.actions.filter((_, at) => at !== index));
    this.#deps.channel.undo();
  }

  clear(): void {
    if (!this.canClear) return;

    this.release();
    this.#replace([]);
    this.#deps.channel.clear();
  }

  // B, E, F pick a tool, 1–4 a size, Ctrl/Cmd+Z undoes. Returns whether the key was used.
  pressKey(key: string, withModifier: boolean): boolean {
    const lower = key.toLowerCase();
    const size = Number(key);
    const isSize = Number.isInteger(size) && size >= 1 && size <= brushSizes.length;
    const tool = toolKeys[lower];

    if (!this.canDraw) return false;

    if (withModifier) {
      if (lower === 'z') this.undo();

      return lower === 'z';
    }

    if (tool) this.selectTool(tool);
    else if (isSize) this.selectSize(size - 1);

    return Boolean(tool) || isSize;
  }

  // Someone else's line on the doodle board.
  receive(op: BoardOp): void {
    if (op.type === 'stroke') this.#appendRemote(op.authorId, op.batch);
    else if (op.type === 'fill') this.actions.push({ kind: 'fill', authorId: op.authorId, ...op.fill });
    else this.#replace(this.actions.filter((action) => action.id !== op.id));

    this.version += 1;
  }

  // A fresh board for `key` (a new page, a new squiggle); the same key keeps what's on it.
  load(key: string, actions: readonly BoardAction[], base: readonly BoardAction[] = []): void {
    if (key === this.#key) return;

    this.#key = key;
    this.base = [...base];
    this.restore(actions);
  }

  // Everything on the board at once, as the table has it (after joining or reconnecting).
  restore(actions: readonly BoardAction[]): void {
    this.release();
    this.#replace(actions.map((action) => (action.kind === 'stroke' ? { ...action, points: [...action.points] } : action)));
  }

  #appendRemote(authorId: string, batch: StrokeBatch): void {
    const existing = this.actions.findLast((action) => action.kind === 'stroke' && action.id === batch.strokeId);

    if (existing?.kind === 'stroke') existing.points.push(...batch.points);
    else this.actions.push({ kind: 'stroke', id: batch.strokeId, authorId, color: batch.color, size: batch.size, eraser: batch.eraser, points: [...batch.points] });
  }

  #replace(remaining: BoardAction[]): void {
    this.actions = remaining;
    this.revision += 1;
    this.version += 1;
  }

  #scheduleFlush(): void {
    this.#cancelFlush ??= this.#deps.schedule(this.flush, this.#deps.flushMs);
  }
}
