import { encodeDrawing } from '@telephone-table/engine';
import type { BoardAction, BoardFill, BoardOp, StrokeBatch } from '@telephone-table/protocol';
import { TableRoomError } from './error.js';

export interface TableRoomDrawingCaps {
  maxActions: number;
  maxPoints: number;
}

// Board units are kept in halves, as the bytes carry them (engine `encodeDrawing`), so the saved
// page, the reveal and a reload all agree to the point.
const half = (value: number): number => Math.round(value * 2) / 2;

// One board's strokes and fills, with who made each (spec §6): a page being drawn, or the lobby's
// doodle board. Whoever owns it checks who may draw first. Each move returns the op to pass on,
// for a board that others watch live.
export class TableRoomDrawing {
  #actions: BoardAction[] = [];
  readonly #byId = new Map<string, BoardAction>();
  #points = 0;
  readonly #caps: TableRoomDrawingCaps;

  constructor(caps: TableRoomDrawingCaps) {
    this.#caps = caps;
  }

  get actions(): readonly BoardAction[] {
    return this.#actions;
  }

  // A new stroke, or more points of one this person started.
  stroke(authorId: string, batch: StrokeBatch): BoardOp {
    const points = batch.points.map(half);
    const existing = this.#byId.get(batch.strokeId);

    if (existing && (existing.kind !== 'stroke' || existing.authorId !== authorId)) throw new TableRoomError('TAKEN_ID');

    this.#reserve(existing ? 0 : 1, points.length / 2);

    if (existing?.kind === 'stroke') existing.points.push(...points);
    else this.#add({ kind: 'stroke', id: batch.strokeId, authorId, color: batch.color, size: batch.size, eraser: batch.eraser, points });

    return { type: 'stroke', authorId, batch: { ...batch, points } };
  }

  fill(authorId: string, fill: BoardFill): BoardOp {
    if (this.#byId.has(fill.id)) throw new TableRoomError('TAKEN_ID');

    const placed = { ...fill, x: half(fill.x), y: half(fill.y) };

    this.#reserve(1, 0);
    this.#add({ kind: 'fill', authorId, ...placed });

    return { type: 'fill', authorId, fill: placed };
  }

  // Takes back this person's own last action; everyone else's stay.
  undo(authorId: string): BoardOp {
    const index = this.#actions.findLastIndex((action) => action.authorId === authorId);
    const action = this.#actions[index];

    if (!action) throw new TableRoomError('NOTHING_TO_UNDO');

    this.#actions = this.#actions.filter((_, at) => at !== index);
    this.#byId.delete(action.id);
    this.#points -= action.kind === 'stroke' ? action.points.length / 2 : 0;

    return { type: 'undo', id: action.id };
  }

  // A blank board.
  reset(): void {
    this.#actions = [];
    this.#byId.clear();
    this.#points = 0;
  }

  encode(): Uint8Array {
    return encodeDrawing(this.#actions);
  }

  #reserve(actions: number, points: number): void {
    if (this.#actions.length + actions > this.#caps.maxActions || this.#points + points > this.#caps.maxPoints) throw new TableRoomError('PAGE_FULL');

    this.#points += points;
  }

  #add(action: BoardAction): void {
    this.#actions.push(action);
    this.#byId.set(action.id, action);
  }
}
