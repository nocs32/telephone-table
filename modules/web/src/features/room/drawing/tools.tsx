import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { EraserIcon, PaintBucketIcon, PencilIcon } from '../../../assets';
import type { RoomBoardStore } from '../../../stores/room/board';
import { useRootStore } from '../../../stores/use-root-store';
import { DrawingToolsRoot, DrawingToolsButton, DrawingToolsGroup } from './styled-components';
import { DrawingToolsColors } from './tools-colors';
import { DrawingToolsHistory } from './tools-history';
import { DrawingToolsSizes } from './tools-sizes';

interface DrawingToolsProps {
  board: RoomBoardStore;
}

// Scribble Table's tools as they are: brush, eraser and fill, four sizes, sixteen colours, undo
// and (on a page) clear, with the same keys (B, E, F, 1–4, Ctrl+Z).
export const DrawingTools = observer(function DrawingTools({ board }: DrawingToolsProps): ReactElement {
  const { locale } = useRootStore();

  return (
    <DrawingToolsRoot role="toolbar" aria-label={locale.t('board.tools')}>
      <DrawingToolsGroup>
        {board.toolViews.map((view) => (
          <DrawingToolsButton key={view.tool} type="button" aria-pressed={view.isSelected} aria-label={view.label} title={view.label} onClick={() => board.selectTool(view.tool)}>
            {view.tool === 'brush' && <PencilIcon />}
            {view.tool === 'eraser' && <EraserIcon />}
            {view.tool === 'fill' && <PaintBucketIcon />}
          </DrawingToolsButton>
        ))}
      </DrawingToolsGroup>
      <DrawingToolsSizes board={board} />
      <DrawingToolsColors board={board} />
      <DrawingToolsHistory board={board} />
    </DrawingToolsRoot>
  );
});
