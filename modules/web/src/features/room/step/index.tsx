import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomStepDraw } from './draw';
import { RoomStepHeader } from './header';
import { RoomStepRoot } from './styled-components';
import { RoomStepWatching } from './watching';
import { RoomStepWrite } from './write';

// One step (spec §4.3): everyone works on a page at once, each in a different book. A new step
// deals a new card onto the table.
export const RoomStep = observer(function RoomStep(): ReactElement {
  const { game, step } = useRootStore().room;

  return (
    <RoomStepRoot key={game.stepKey}>
      <RoomStepHeader />
      {step.isWatching && <RoomStepWatching />}
      {step.isWrite && <RoomStepWrite />}
      {step.isDraw && <RoomStepDraw />}
    </RoomStepRoot>
  );
});
