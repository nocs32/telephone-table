import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { RoomBoardStore } from '../../../stores/room/board';
import { useRootStore } from '../../../stores/use-root-store';
import { DrawingToolsSwatch, DrawingToolsSwatches } from './styled-components';

interface DrawingToolsColorsProps {
  board: RoomBoardStore;
}

// The 16 inks, in two rows.
export const DrawingToolsColors = observer(function DrawingToolsColors({ board }: DrawingToolsColorsProps): ReactElement {
  const { locale } = useRootStore();

  return (
    <DrawingToolsSwatches role="group" aria-label={locale.t('board.colors')}>
      {board.colorViews.map((view) => (
        <DrawingToolsSwatch
          key={view.name}
          type="button"
          ink={view.name}
          selected={view.isSelected}
          aria-pressed={view.isSelected}
          aria-label={view.label}
          title={view.label}
          onClick={() => board.selectColor(view.index)}
        />
      ))}
    </DrawingToolsSwatches>
  );
});
