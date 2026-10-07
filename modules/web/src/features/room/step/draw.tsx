import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CheckIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button, NotebookSpiral, NotebookTurn } from '../../../ui';
import { DrawingBoard, DrawingTools } from '../drawing';
import { RoomStepPage, RoomStepPageBody, RoomStepPageFoot, RoomStepPageHead, RoomStepPageLabel, RoomStepPageNumber, RoomStepTray } from './styled-components';
import { RoomStepWaiting } from './waiting';

// A draw step (spec §4.3) on a page of the notebook: the sentence written at the top, your drawing
// taped in under it (as it will be at the reveal), and the tools on a tray at the bottom.
export const RoomStepDraw = observer(function RoomStepDraw(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { game, step } = room;

  return (
    <RoomStepPage>
      <NotebookSpiral aria-hidden />
      <RoomStepPageHead empty={step.isSentenceEmpty}>
        <RoomStepPageLabel>{t('step.drawThis')}</RoomStepPageLabel>
        {step.sentence}
      </RoomStepPageHead>
      <RoomStepPageBody>
        <DrawingBoard board={step.board} label={t('step.yourDrawing')} taped />
      </RoomStepPageBody>
      <RoomStepPageFoot>
        <RoomStepTray>
          <DrawingTools board={step.board} />
        </RoomStepTray>
        <Button tone="primary" type="button" disabled={!step.canEdit} onClick={step.done}>
          <CheckIcon />
          {t('step.done')}
        </Button>
      </RoomStepPageFoot>
      <RoomStepPageNumber aria-hidden>{game.pageNumber}</RoomStepPageNumber>
      {step.state === 'done' && <RoomStepWaiting />}
      <NotebookTurn />
    </RoomStepPage>
  );
});
