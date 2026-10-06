import type { ReactElement } from 'react';
import type { PodiumPlaceView } from '../../../stores/room/shelf';
import { Avatar } from '../../../ui';
import { RoomShelfPodiumPlaceBlock, RoomShelfPodiumPlaceName, RoomShelfPodiumPlacePoints, RoomShelfPodiumPlaceRoot } from './styled-components';

interface RoomShelfPodiumPlaceProps {
  place: PodiumPlaceView;
}

// One step of the podium: silver, gold and bronze stand left to right.
export function RoomShelfPodiumPlace({ place }: RoomShelfPodiumPlaceProps): ReactElement {
  const { player, medal } = place;

  return (
    <RoomShelfPodiumPlaceRoot medal={medal}>
      <Avatar initial={player.initial} color={player.color} size="lg" />
      <RoomShelfPodiumPlaceName>{player.name}</RoomShelfPodiumPlaceName>
      <RoomShelfPodiumPlacePoints title={player.pointsLabel}>{player.points}</RoomShelfPodiumPlacePoints>
      <RoomShelfPodiumPlaceBlock medal={medal}>{player.placeLabel}</RoomShelfPodiumPlaceBlock>
    </RoomShelfPodiumPlaceRoot>
  );
}
