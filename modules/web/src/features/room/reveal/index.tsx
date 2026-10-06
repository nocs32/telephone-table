import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { Avatar, NotebookSpiral, NotebookTurn } from '../../../ui';
import { RoomRevealControls } from './controls';
import { RoomRevealStickers } from './stickers';
import { RoomRevealBook, RoomRevealCounter, RoomRevealDesk, RoomRevealHeader, RoomRevealRoot, RoomRevealTitle } from './styled-components';
import { RoomRevealThread } from './thread';

// The reveal (spec §4.5): one book at a time, as a notebook, its pages stacking like a chat thread
// as its owner turns them for everyone, with a sheet of stickers to stick on them (spec D25). Each
// new book turns the page.
export const RoomReveal = observer(function RoomReveal(): ReactElement {
  const { reveal } = useRootStore().room;

  return (
    <RoomRevealRoot>
      <RoomRevealDesk>
        <RoomRevealBook key={reveal.snapshot?.bookId}>
          <NotebookSpiral aria-hidden />
          <RoomRevealHeader>
            <Avatar initial={reveal.owner.initial} color={reveal.owner.color} size="lg" />
            <RoomRevealTitle>{reveal.title}</RoomRevealTitle>
            <RoomRevealCounter>{reveal.counter}</RoomRevealCounter>
          </RoomRevealHeader>
          <RoomRevealThread />
          <NotebookTurn aria-hidden />
        </RoomRevealBook>
        <RoomRevealStickers />
      </RoomRevealDesk>
      <RoomRevealControls />
    </RoomRevealRoot>
  );
});
