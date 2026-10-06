import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CheckIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { DrawingBoard, DrawingTools } from '../drawing';
import { RoomStepDrawArea, RoomStepDrawBar, RoomStepDrawLabel, RoomStepDrawRoot, RoomStepDrawSentence } from './styled-components';
import { RoomStepWaiting } from './waiting';

// A draw step (spec §4.3): the sentence stays above the board while you draw; the tools and Done
// sit below it.
export const RoomStepDraw = observer(function RoomStepDraw(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { step } = room;

  return (
    <RoomStepDrawRoot>
      <RoomStepDrawSentence empty={step.isSentenceEmpty}>
        <RoomStepDrawLabel>{t('step.drawThis')}</RoomStepDrawLabel>
        {step.sentence}
      </RoomStepDrawSentence>
      <RoomStepDrawArea>
        <DrawingBoard board={step.board} label={t('step.yourDrawing')} />
        {step.state === 'done' && <RoomStepWaiting />}
      </RoomStepDrawArea>
      <RoomStepDrawBar>
        <DrawingTools board={step.board} />
        <Button tone="primary" type="button" disabled={!step.canEdit} onClick={step.done}>
          <CheckIcon />
          {t('step.done')}
        </Button>
      </RoomStepDrawBar>
    </RoomStepDrawRoot>
  );
});
