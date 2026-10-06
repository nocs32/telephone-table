import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../stores/use-root-store';
import { RoomBreak } from './break';
import { RoomLobby } from './lobby';
import { RoomReveal } from './reveal';
import { RoomShelf } from './shelf';
import { RoomStep } from './step';

// The screen for the game's phase (spec §8).
export const RoomStage = observer(function RoomStage(): ReactElement {
  const { game } = useRootStore().room;

  switch (game.state) {
    case 'lobby':
      return <RoomLobby />;
    case 'step':
      return <RoomStep />;
    case 'reveal':
      return <RoomReveal />;
    case 'break':
      return <RoomBreak />;
    default:
      return <RoomShelf />;
  }
});
