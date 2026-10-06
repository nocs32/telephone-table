import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomStepDraw } from './draw';
import { RoomStepHeader } from './header';
import { RoomStepPeople } from './people';
import { RoomStepBody, RoomStepMain, RoomStepRoot } from './styled-components';
import { RoomStepWatching } from './watching';
import { RoomStepWrite } from './write';

// One step (spec §4.3): everyone works on a page at once, each in a different book. Each step
// turns to a new page of the notebook, with who's done beside it.
export const RoomStep = observer(function RoomStep(): ReactElement {
  const { game, step } = useRootStore().room;

  return (
    <RoomStepRoot key={game.stepKey}>
      <RoomStepHeader />
      <RoomStepBody>
        <RoomStepMain>
          {step.isWatching && <RoomStepWatching />}
          {step.isWrite && <RoomStepWrite />}
          {step.isDraw && <RoomStepDraw />}
        </RoomStepMain>
        <RoomStepPeople />
      </RoomStepBody>
    </RoomStepRoot>
  );
});
