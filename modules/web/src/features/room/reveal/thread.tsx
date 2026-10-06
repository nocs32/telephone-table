import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { PageCard } from '../page';
import { RoomRevealThreadRoot } from './styled-components';
import { useRoomRevealThreadScroll } from './use-thread';

// The pages turned so far, newest at the bottom. The newest flips in; its drawing replays.
export const RoomRevealThread = observer(function RoomRevealThread(): ReactElement {
  const { reveal } = useRootStore().room;
  const pages = reveal.pages;
  const scrollRef = useRoomRevealThreadScroll(pages.length);

  return (
    <RoomRevealThreadRoot ref={scrollRef} aria-live="polite">
      {pages.map((page, index) => (
        <PageCard
          key={page.id}
          page={page}
          tilt={index % 4 === 1 ? 'left' : 'right'}
          isNew={index === pages.length - 1}
          replayFrom={page.replayFrom}
          onSkip={page.canSkip ? reveal.skipReplay : undefined}
          onPickFavourite={page.canPickFavourite ? () => reveal.pickFavourite(page.id) : undefined}
        />
      ))}
    </RoomRevealThreadRoot>
  );
});
