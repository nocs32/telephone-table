import { observer } from 'mobx-react-lite';
import type { ReactElement, ReactNode } from 'react';
import { boardPixelHeight, boardPixelWidth } from '../../../services/board-painter';
import type { RoomBoardStore } from '../../../stores/room/board';
import { DrawingBoardCanvas, DrawingBoardPaper, DrawingBoardRoot } from './styled-components';
import { useDrawingBoard } from './use-board';

interface DrawingBoardProps {
  board: RoomBoardStore;
  label: string;
  // Taped into a notebook page, as at the reveal.
  taped?: boolean;
  // Notes on the paper, such as the doodle board's caption.
  children?: ReactNode;
}

// White paper to draw on (spec §5.3): the lobby's doodle board, or your page in a draw step.
export const DrawingBoard = observer(function DrawingBoard({ board, label, taped = false, children }: DrawingBoardProps): ReactElement {
  const canvasRef = useDrawingBoard(board);

  return (
    <DrawingBoardRoot taped={taped}>
      <DrawingBoardPaper taped={taped}>
        <DrawingBoardCanvas ref={canvasRef} width={boardPixelWidth} height={boardPixelHeight} cursor={board.cursor} role="img" aria-label={label} />
        {children}
      </DrawingBoardPaper>
    </DrawingBoardRoot>
  );
});
