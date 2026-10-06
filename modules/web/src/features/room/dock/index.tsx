import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomDockChat } from './chat';
import { RoomDockPicker } from './picker';
import { RoomDockQuick } from './quick';
import { RoomDockDivider, RoomDockRoot } from './styled-components';

// Reactions fly the whole time (spec §7): a click sends one, press and hold streams them. The chat
// is one button away.
export const RoomDock = observer(function RoomDock(): ReactElement {
  const { locale, room } = useRootStore();

  return (
    <RoomDockRoot role="toolbar" aria-label={locale.t('reactions.label')}>
      {room.reactions.quickButtons.map((button) => (
        <RoomDockQuick key={button.emoji} button={button} />
      ))}
      <RoomDockPicker />
      <RoomDockDivider />
      <RoomDockChat />
    </RoomDockRoot>
  );
});
