import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { TrashIcon, UndoIcon } from '../../../assets';
import type { RoomBoardStore } from '../../../stores/room/board';
import { useRootStore } from '../../../stores/use-root-store';
import { ConfirmPopover } from '../../../ui';
import { DrawingToolsButton, DrawingToolsGroup } from './styled-components';

interface DrawingToolsHistoryProps {
  board: RoomBoardStore;
}

// Undo takes back your own lines; clearing a whole page asks first.
export const DrawingToolsHistory = observer(function DrawingToolsHistory({ board }: DrawingToolsHistoryProps): ReactElement {
  const { t } = useRootStore().locale;

  return (
    <DrawingToolsGroup>
      <DrawingToolsButton type="button" disabled={!board.canUndo} aria-label={t('board.undo')} title={t('board.undo')} onClick={board.undo}>
        <UndoIcon />
      </DrawingToolsButton>
      {board.canClearAll && (
        <ConfirmPopover title={t('board.clearConfirm')} cancelLabel={t('board.clearNo')} confirmLabel={t('board.clearYes')} onConfirm={board.clear}>
          <DrawingToolsButton type="button" disabled={!board.canClear} aria-label={t('board.clear')} title={t('board.clear')}>
            <TrashIcon />
          </DrawingToolsButton>
        </ConfirmPopover>
      )}
    </DrawingToolsGroup>
  );
});
