import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { PageCard } from '../page';
import { RoomShelfPodiumAward, RoomShelfPodiumAwardTitle } from './styled-components';

// Best drawing and best line (spec §5.5): the most-liked pages of the game, shown themselves.
export const RoomShelfPodiumAwards = observer(function RoomShelfPodiumAwards(): ReactElement {
  const { shelf } = useRootStore().room;

  return (
    <>
      {shelf.podium.awards.map((award) => (
        <RoomShelfPodiumAward key={award.kind}>
          <RoomShelfPodiumAwardTitle>{award.title}</RoomShelfPodiumAwardTitle>
          {award.pages.map((page) => (
            <PageCard key={page.id} page={page} tilt="right" />
          ))}
        </RoomShelfPodiumAward>
      ))}
    </>
  );
});
