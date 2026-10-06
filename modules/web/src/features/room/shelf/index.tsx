import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CrownIcon, PlayAgainIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { RoomShelfBook } from './book';
import { RoomShelfCover } from './cover';
import { RoomShelfPodium } from './podium';
import {
  RoomShelfActions,
  RoomShelfGrid,
  RoomShelfHeader,
  RoomShelfRoot,
  RoomShelfRound,
  RoomShelfRoundTitle,
  RoomShelfSubtitle,
  RoomShelfTitle,
} from './styled-components';

// After the last round (spec §4.7): every book from every round, grouped by round, to open and
// flip through at your own pace, each with Save. The podium comes first when points are on.
export const RoomShelf = observer(function RoomShelf(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { books, shelf, game } = room;

  return (
    <RoomShelfRoot>
      <RoomShelfHeader>
        <div>
          <RoomShelfTitle>{t('shelf.title')}</RoomShelfTitle>
          <RoomShelfSubtitle>{t('shelf.subtitle')}</RoomShelfSubtitle>
        </div>
        <RoomShelfActions>
          {shelf.canShowPodium && (
            <Button tone="secondary" type="button" onClick={shelf.showPodium}>
              <CrownIcon />
              {t('shelf.podium')}
            </Button>
          )}
          <Button tone="primary" type="button" onClick={game.playAgain}>
            <PlayAgainIcon />
            {t('podium.playAgain')}
          </Button>
        </RoomShelfActions>
      </RoomShelfHeader>
      {books.rounds.map((round) => (
        <RoomShelfRound key={round.round}>
          <RoomShelfRoundTitle>{round.label}</RoomShelfRoundTitle>
          <RoomShelfGrid>
            {round.books.map((cover) => (
              <RoomShelfCover key={cover.id} cover={cover} />
            ))}
          </RoomShelfGrid>
        </RoomShelfRound>
      ))}
      {shelf.openBook && <RoomShelfBook />}
      {shelf.showsPodium && <RoomShelfPodium />}
    </RoomShelfRoot>
  );
});
