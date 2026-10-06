import { boardHeight, boardWidth } from '@telephone-table/protocol';
import { autorun } from 'mobx';
import { useEffect, useRef, type RefObject } from 'react';
import { BoardPainter } from '../../../services/board-painter';
import type { RoomBoardStore } from '../../../stores/room/board';

// The pointer's position in board units.
const toBoard = (canvas: HTMLCanvasElement, event: PointerEvent): [number, number] => {
  const rect = canvas.getBoundingClientRect();

  return [((event.clientX - rect.left) / rect.width) * boardWidth, ((event.clientY - rect.top) / rect.height) * boardHeight];
};

// A stroke ends when you let go, wherever you let go (spec §6): the button released anywhere on the
// page, the pointer capture lost, a move arriving with no button held, or the window losing focus.
// (Scribble Table missed the last ones, so a line could keep drawing after a release off the board.)
const listenToPointer = (canvas: HTMLCanvasElement, board: RoomBoardStore): (() => void) => {
  const listening = new AbortController();
  const { signal } = listening;
  const end = (): void => board.release();

  const down = (event: PointerEvent): void => {
    if (!board.canDraw || event.button !== 0) return;

    canvas.setPointerCapture(event.pointerId);
    board.press(...toBoard(canvas, event));
  };

  // Coalesced events: every point the pointer passed, not just one per frame.
  const move = (event: PointerEvent): void => {
    if (board.state !== 'stroking') return;

    if (event.buttons === 0) {
      end();

      return;
    }

    const events = event.getCoalescedEvents();

    (events.length > 0 ? events : [event]).forEach((each) => board.drag(...toBoard(canvas, each)));
  };

  canvas.addEventListener('pointerdown', down, { signal });
  canvas.addEventListener('pointermove', move, { signal });
  canvas.addEventListener('lostpointercapture', end, { signal });
  window.addEventListener('pointerup', end, { signal });
  window.addEventListener('pointercancel', end, { signal });
  window.addEventListener('blur', end, { signal });

  return () => listening.abort();
};

// Paints the board's actions onto the canvas as they change, and turns the pointer into strokes
// and fills while you may draw. Canvas painting and pointer capture are DOM work, so they live
// here rather than in the store.
export const useDrawingBoard = (board: RoomBoardStore): RefObject<HTMLCanvasElement | null> => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext('2d', { willReadFrequently: true });

    if (!canvas || !context) return undefined;

    const painter = new BoardPainter(context);

    const stopPainting = autorun(() => {
      const { actions, revision } = board.drawing;

      painter.sync(actions, revision);
    });

    const stopListening = listenToPointer(canvas, board);

    return () => {
      stopPainting();
      stopListening();
      board.release();
    };
  }, [board]);

  return ref;
};
