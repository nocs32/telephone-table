import { Switch } from '@ark-ui/react/switch';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomLobbyHint, RoomLobbySwitchControl, RoomLobbySwitchLabel, RoomLobbySwitchRoot, RoomLobbySwitchText, RoomLobbySwitchThumb } from './styled-components';

// Points, just for fun (spec D7): likes, favourites and the podium, or none of it.
export const RoomLobbySettingsPoints = observer(function RoomLobbySettingsPoints(): ReactElement {
  const { locale, room } = useRootStore();
  const { settings } = room.game;

  return (
    <RoomLobbySwitchRoot checked={settings.points} disabled={!settings.isEditable} onCheckedChange={(details) => settings.setPoints(details.checked)}>
      <RoomLobbySwitchText>
        <RoomLobbySwitchLabel>{locale.t('lobby.points')}</RoomLobbySwitchLabel>
        <RoomLobbyHint>{settings.pointsHint}</RoomLobbyHint>
      </RoomLobbySwitchText>
      <RoomLobbySwitchControl>
        <RoomLobbySwitchThumb />
      </RoomLobbySwitchControl>
      <Switch.HiddenInput />
    </RoomLobbySwitchRoot>
  );
});
