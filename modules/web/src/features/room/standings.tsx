import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../stores/use-root-store';
import { Avatar } from '../../ui';
import { StandingsItem, StandingsName, StandingsPlace, StandingsPoints, StandingsRoot } from './styled-components';

// Everyone's points so far, most first (between rounds and on the podium).
export const Standings = observer(function Standings(): ReactElement {
  const { locale, room } = useRootStore();

  return (
    <StandingsRoot aria-label={locale.t('players.standings')}>
      {room.presence.standings.map((player) => (
        <StandingsItem key={player.id} me={player.isMe}>
          <StandingsPlace>{player.placeLabel}</StandingsPlace>
          <Avatar initial={player.initial} color={player.color} size="md" />
          <StandingsName>{player.name}</StandingsName>
          <StandingsPoints title={player.pointsLabel}>{player.points}</StandingsPoints>
        </StandingsItem>
      ))}
    </StandingsRoot>
  );
});
