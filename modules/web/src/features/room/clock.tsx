import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../stores/use-root-store';
import { ClockFace, ClockRoot } from './styled-components';
import { useRoomClockRing } from './use-clock';

// Seconds left in the step or the break, inside a ring that runs down; it pulses in the last ten.
export const Clock = observer(function Clock(): ReactElement {
  const { game } = useRootStore().room;
  const ringRef = useRoomClockRing(game);

  return (
    <ClockRoot ref={ringRef} role="timer" aria-label={game.timerLabel} title={game.timerLabel} urgent={game.clock.isUrgent}>
      <ClockFace>{game.clock.secondsLeft}</ClockFace>
    </ClockRoot>
  );
});
