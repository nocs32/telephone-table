import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CheckIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Avatar } from '../../../ui';
import {
  RoomStepPeopleCount,
  RoomStepPeopleHead,
  RoomStepPeopleItem,
  RoomStepPeopleList,
  RoomStepPeopleName,
  RoomStepPeopleRoot,
  RoomStepPeopleStatus,
  RoomStepPeopleTitle,
} from './styled-components';

// Who's done and who's still writing or drawing, by name (spec §8). Unlike the avatars in the top
// bar (everyone at the table), this is only the people with a seat this round.
export const RoomStepPeople = observer(function RoomStepPeople(): ReactElement {
  const { locale, room } = useRootStore();
  const { step } = room;

  return (
    <RoomStepPeopleRoot aria-label={locale.t('step.people')}>
      <RoomStepPeopleHead>
        <RoomStepPeopleTitle>{locale.t('step.people')}</RoomStepPeopleTitle>
        <RoomStepPeopleCount>{step.progressLabel}</RoomStepPeopleCount>
      </RoomStepPeopleHead>
      <RoomStepPeopleList>
        {step.workerViews.map((view) => (
          <RoomStepPeopleItem key={view.player.id} status={view.status}>
            <Avatar initial={view.player.initial} color={view.player.color} size="md" />
            <RoomStepPeopleName>{view.player.name}</RoomStepPeopleName>
            <RoomStepPeopleStatus status={view.status} aria-label={view.statusLabel}>
              {view.status === 'done' && <CheckIcon />}
              {view.statusLabel}
            </RoomStepPeopleStatus>
          </RoomStepPeopleItem>
        ))}
      </RoomStepPeopleList>
    </RoomStepPeopleRoot>
  );
});
