import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CheckIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Avatar } from '../../../ui';
import { RoomStepHeaderProgressAvatars, RoomStepHeaderProgressItem, RoomStepHeaderProgressLabel, RoomStepHeaderProgressRoot, RoomStepHeaderProgressTick } from './styled-components';

// "3 of 5 done", with everyone's avatar, ticked once they're done (spec §8).
export const RoomStepHeaderProgress = observer(function RoomStepHeaderProgress(): ReactElement {
  const { step } = useRootStore().room;

  return (
    <RoomStepHeaderProgressRoot aria-label={step.progressLabel}>
      <RoomStepHeaderProgressAvatars>
        {step.workers.map((worker) => (
          <RoomStepHeaderProgressItem key={worker.id} done={worker.done} title={worker.name}>
            <Avatar initial={worker.initial} color={worker.color} size="md" />
            {worker.done && (
              <RoomStepHeaderProgressTick>
                <CheckIcon />
              </RoomStepHeaderProgressTick>
            )}
          </RoomStepHeaderProgressItem>
        ))}
      </RoomStepHeaderProgressAvatars>
      <RoomStepHeaderProgressLabel aria-hidden>{step.progressLabel}</RoomStepHeaderProgressLabel>
    </RoomStepHeaderProgressRoot>
  );
});
