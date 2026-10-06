import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CrownIcon, PlayAgainIcon } from '../../../assets';
import { confettiPieces } from '../../../stores/room/shelf';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { Standings } from '../standings';
import { RoomShelfPodiumAwards } from './podium-awards';
import { RoomShelfPodiumPlace } from './podium-place';
import {
  RoomShelfPodiumButtons,
  RoomShelfPodiumCard,
  RoomShelfPodiumConfetti,
  RoomShelfPodiumCrown,
  RoomShelfPodiumPlaces,
  RoomShelfPodiumRoot,
  RoomShelfPodiumTitle,
} from './styled-components';

// The podium (spec §4.7): the top three with confetti, everyone's points, then the two awards with
// the pages themselves. Closing it shows the shelf.
export const RoomShelfPodium = observer(function RoomShelfPodium(): ReactElement {
  const { locale, room } = useRootStore();
  const { shelf, game } = room;
  const { podium } = shelf;

  return (
    <RoomShelfPodiumRoot role="dialog" aria-label={podium.title}>
      {confettiPieces.map((piece) => (
        <RoomShelfPodiumConfetti key={piece.id} lane={piece.lane} delay={piece.delay} ink={piece.ink} aria-hidden />
      ))}
      <RoomShelfPodiumCard>
        <RoomShelfPodiumCrown>
          <CrownIcon />
        </RoomShelfPodiumCrown>
        <RoomShelfPodiumTitle>{podium.title}</RoomShelfPodiumTitle>
        <RoomShelfPodiumPlaces>
          {podium.places.map((place) => (
            <RoomShelfPodiumPlace key={place.player.id} place={place} />
          ))}
        </RoomShelfPodiumPlaces>
        <Standings />
        <RoomShelfPodiumAwards />
        <RoomShelfPodiumButtons>
          <Button tone="secondary" type="button" onClick={shelf.closePodium}>
            {locale.t('podium.browse')}
          </Button>
          <Button tone="primary" type="button" onClick={game.playAgain}>
            <PlayAgainIcon />
            {locale.t('podium.playAgain')}
          </Button>
        </RoomShelfPodiumButtons>
      </RoomShelfPodiumCard>
    </RoomShelfPodiumRoot>
  );
});
