import { timelapseFrame, timelapseMs } from '@telephone-table/engine';
import type { BoardAction } from '@telephone-table/protocol';
import { useEffect, useRef, type RefObject } from 'react';
import { BoardPainter, pageScale } from '../../../services/board-painter';

// Paints a page's drawing: at once, or (from `replayFrom` on) as the reveal's time-lapse, 4 to 8
// seconds whatever its length (spec §6). Every screen counts from the same moment, so everyone sees
// the same stroke at the same time. Frame-by-frame painting is DOM work, so it lives here.
export const usePageDrawing = (actions: readonly BoardAction[], replayFrom: number | null): RefObject<HTMLCanvasElement | null> => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = ref.current?.getContext('2d', { willReadFrequently: true });

    if (!context) return undefined;

    const painter = new BoardPainter(context, pageScale);

    if (replayFrom === null) {
      painter.sync(actions, 0);

      return undefined;
    }

    const durationMs = timelapseMs(actions);
    let frame = 0;

    const paint = (): void => {
      const progress = (Date.now() - replayFrom) / durationMs;

      painter.sync(timelapseFrame(actions, progress), 0);

      if (progress < 1) frame = requestAnimationFrame(paint);
    };

    paint();

    return () => cancelAnimationFrame(frame);
  }, [actions, replayFrom]);

  return ref;
};
