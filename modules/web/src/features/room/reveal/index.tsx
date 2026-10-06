import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { Avatar } from '../../../ui';
import { RoomRevealControls } from './controls';
import { RoomRevealBook, RoomRevealCounter, RoomRevealHeader, RoomRevealRoot, RoomRevealSpiral, RoomRevealTitle } from './styled-components';
import { RoomRevealThread } from './thread';

// The reveal (spec §4.5): one book at a time, as a notebook, its pages stacking like a chat thread
// as its owner turns them for everyone.
export const RoomReveal = observer(function RoomReveal(): ReactElement {
  const { reveal } = useRootStore().room;

  return (
    <RoomRevealRoot>
      <RoomRevealBook key={reveal.snapshot?.bookId}>
        <RoomRevealSpiral aria-hidden />
        <RoomRevealHeader>
          <Avatar initial={reveal.owner.initial} color={reveal.owner.color} size="lg" />
          <RoomRevealTitle>{reveal.title}</RoomRevealTitle>
          <RoomRevealCounter>{reveal.counter}</RoomRevealCounter>
        </RoomRevealHeader>
        <RoomRevealThread />
      </RoomRevealBook>
      <RoomRevealControls />
    </RoomRevealRoot>
  );
});
