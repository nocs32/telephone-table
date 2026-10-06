import { boardHeight, boardWidth, type BoardAction } from '@telephone-table/protocol';
import type { ReactElement } from 'react';
import { PageDrawingCanvas, PageDrawingSheet, PageDrawingSkip } from './styled-components';
import { usePageDrawing } from './use-drawing';

interface PageDrawingProps {
  actions: readonly BoardAction[];
  label: string;
  tilt: 'left' | 'right' | 'none';
  // The time-lapse runs from here; null shows the finished picture.
  replayFrom?: number | null;
  // Tapping skips the time-lapse to the finished picture.
  onSkip?: () => void;
  skipLabel?: string;
}

// A drawing taped into the book (spec D15).
export function PageDrawing({ actions, label, tilt, replayFrom = null, onSkip, skipLabel }: PageDrawingProps): ReactElement {
  const canvasRef = usePageDrawing(actions, replayFrom);
  const canvas = <PageDrawingCanvas ref={canvasRef} width={boardWidth} height={boardHeight} role="img" aria-label={label} />;

  return (
    <PageDrawingSheet tilt={tilt}>
      {onSkip ? (
        <PageDrawingSkip type="button" onClick={onSkip} title={skipLabel} aria-label={skipLabel}>
          {canvas}
        </PageDrawingSkip>
      ) : (
        canvas
      )}
    </PageDrawingSheet>
  );
}
