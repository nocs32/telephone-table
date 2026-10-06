import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { UndoIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { RoomStepWaitingCard, RoomStepWaitingRoot, RoomStepWaitingText, RoomStepWaitingTitle } from './styled-components';

// After Done (spec §4.3): your page is locked, and Not done takes it back until the step ends.
export const RoomStepWaiting = observer(function RoomStepWaiting(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { step } = room;

  return (
    <RoomStepWaitingRoot>
      <RoomStepWaitingCard role="status">
        <RoomStepWaitingTitle>{t('step.doneTitle')}</RoomStepWaitingTitle>
        <RoomStepWaitingText>{step.waitingLabel}</RoomStepWaitingText>
        <Button tone="secondary" size="sm" type="button" onClick={step.undone}>
          <UndoIcon />
          {t('step.notDone')}
        </Button>
      </RoomStepWaitingCard>
    </RoomStepWaitingRoot>
  );
});
