import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomStepWatchingEmoji, RoomStepWatchingRoot, RoomStepWatchingText } from './styled-components';

// Joined mid-round (spec §4.6): you watch, and get a seat when the next round starts.
export const RoomStepWatching = observer(function RoomStepWatching(): ReactElement {
  const { locale } = useRootStore();

  return (
    <RoomStepWatchingRoot role="status">
      <RoomStepWatchingEmoji aria-hidden>👀</RoomStepWatchingEmoji>
      <RoomStepWatchingText>{locale.t('step.watchingText')}</RoomStepWatchingText>
    </RoomStepWatchingRoot>
  );
});
