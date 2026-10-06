import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { RoomLobbyDoodle } from './doodle';
import { RoomLobbyPlayers } from './players';
import { RoomLobbySettings } from './settings';
import { RoomLobbyRoot } from './styled-components';

// While people gather (spec §4.2): who's here, the doodle board, and the settings with Start.
export const RoomLobby = observer(function RoomLobby(): ReactElement {
  return (
    <RoomLobbyRoot>
      <RoomLobbyPlayers />
      <RoomLobbyDoodle />
      <RoomLobbySettings />
    </RoomLobbyRoot>
  );
});
