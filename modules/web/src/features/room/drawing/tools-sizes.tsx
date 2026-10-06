import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { RoomBoardStore } from '../../../stores/room/board';
import { useRootStore } from '../../../stores/use-root-store';
import { DrawingToolsButton, DrawingToolsDot, DrawingToolsGroup } from './styled-components';

interface DrawingToolsSizesProps {
  board: RoomBoardStore;
}

// Four brush sizes, shown as dots (keys 1–4).
export const DrawingToolsSizes = observer(function DrawingToolsSizes({ board }: DrawingToolsSizesProps): ReactElement {
  const { locale } = useRootStore();

  return (
    <DrawingToolsGroup role="group" aria-label={locale.t('board.sizes')}>
      {board.sizeViews.map((view) => (
        <DrawingToolsButton key={view.index} type="button" aria-pressed={view.isSelected} aria-label={view.label} title={view.label} onClick={() => board.selectSize(view.index)}>
          <DrawingToolsDot dot={view.dot} />
        </DrawingToolsButton>
      ))}
    </DrawingToolsGroup>
  );
});
