import type { BoardFill, BoardOp, StrokeBatch } from '@telephone-table/protocol';
import { TableRoomDrawing, type TableRoomDrawingCaps } from './drawing.js';
import { TableRoomError } from './error.js';

export interface TableRoomDoodleDeps {
  caps: TableRoomDrawingCaps;
  random: () => number;
  // The board takes lines only in the lobby.
  isLobby: () => boolean;
}

const newSeed = (random: () => number): number => Math.floor(random() * 2 ** 31);

// The lobby's doodle board (spec D22): a squiggle everyone draws on while they gather. Every
// browser draws the squiggle from its seed, and lines go out live to everyone else, as the
// moves' ops. A new squiggle, and round 1, start it over.
export class TableRoomDoodle {
  squiggle: number;
  readonly #drawing: TableRoomDrawing;
  readonly #deps: TableRoomDoodleDeps;

  constructor(deps: TableRoomDoodleDeps) {
    this.#deps = deps;
    this.#drawing = new TableRoomDrawing(deps.caps);
    this.squiggle = newSeed(deps.random);
  }

  stroke(memberId: string, batch: StrokeBatch): BoardOp {
    this.#permit();

    return this.#drawing.stroke(memberId, batch);
  }

  fill(memberId: string, fill: BoardFill): BoardOp {
    this.#permit();

    return this.#drawing.fill(memberId, fill);
  }

  undo(memberId: string): BoardOp {
    this.#permit();

    return this.#drawing.undo(memberId);
  }

  // The 🎲: a new squiggle on a clean board.
  roll(): void {
    this.#permit();
    this.wipe();
  }

  // A clean board with a new squiggle, as round 1 starts.
  wipe(): void {
    this.squiggle = newSeed(this.#deps.random);
    this.#drawing.reset();
  }

  encode(): Uint8Array {
    return this.#drawing.encode();
  }

  #permit(): void {
    if (!this.#deps.isLobby()) throw new TableRoomError('WRONG_PHASE');
  }
}
