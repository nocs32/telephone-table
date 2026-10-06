import { makeSquiggle } from '@telephone-table/engine';
import type { BoardAction, BoardOp } from '@telephone-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Schedule, SoundsService } from '../../services';
import type { Translate } from '../locale';
import { RoomBoardStore } from './board';
import type { TableSend } from './types';

export interface RoomDoodleDeps {
  t: Translate;
  send: TableSend;
  meId: () => string;
  isLobby: () => boolean;
  sounds: SoundsService;
  now: () => number;
  createId: () => string;
  schedule: Schedule;
}

// Lines on the doodle board go out live, like Scribble Table's strokes.
const doodleFlushMs = 50;

// The lobby's shared doodle board (spec D22): a random unfinished squiggle that everyone can draw
// on at once while people gather. 🎲 swaps the squiggle; round 1 wipes the board.
export class RoomDoodleStore {
  squiggle: number | null = null;
  readonly board: RoomBoardStore;
  readonly #deps: RoomDoodleDeps;

  constructor(deps: RoomDoodleDeps) {
    const { send } = deps;

    this.#deps = deps;

    this.board = new RoomBoardStore({
      ...deps,
      channel: { stroke: (batch) => send('doodleStroke', batch), fill: (fill) => send('doodleFill', fill), undo: () => send('doodleUndo', {}), clear: () => undefined },
      canDraw: deps.isLobby,
      canClearAll: false,
      flushMs: doodleFlushMs,
    });

    makeAutoObservable(this, { board: false }, { autoBind: true });
  }

  // A new seed is a new squiggle on a clean board.
  receive(squiggle: number): void {
    if (squiggle === this.squiggle) return;

    this.squiggle = squiggle;
    this.board.load(`squiggle-${squiggle}`, [], makeSquiggle(squiggle));
  }

  receiveOp(op: BoardOp): void {
    this.board.receive(op);
  }

  restore(actions: BoardAction[]): void {
    this.board.restore(actions);
  }

  newSquiggle(): void {
    if (this.#deps.isLobby()) this.#deps.send('doodleSquiggle', {});
  }
}
