import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { DownloadIcon } from '../../../assets';
import type { BookCoverView } from '../../../stores/room/books';
import { useRootStore } from '../../../stores/use-root-store';
import { Avatar } from '../../../ui';
import {
  RoomShelfCoverOpen,
  RoomShelfCoverOwner,
  RoomShelfCoverPages,
  RoomShelfCoverRoot,
  RoomShelfCoverSave,
  RoomShelfCoverText,
  RoomShelfCoverTitle,
} from './styled-components';

interface RoomShelfCoverProps {
  cover: BookCoverView;
}

// A book on the shelf: a notebook in its owner's colour, with its first sentence on a label.
export const RoomShelfCover = observer(function RoomShelfCover({ cover }: RoomShelfCoverProps): ReactElement {
  const { shelf, books } = useRootStore().room;

  return (
    <RoomShelfCoverRoot tone={cover.owner.color}>
      <RoomShelfCoverOpen type="button" onClick={() => shelf.open(cover.id)}>
        <RoomShelfCoverOwner>
          <Avatar initial={cover.owner.initial} color={cover.owner.color} size="sm" />
          <RoomShelfCoverTitle>{cover.title}</RoomShelfCoverTitle>
        </RoomShelfCoverOwner>
        <RoomShelfCoverText>{cover.cover}</RoomShelfCoverText>
        <RoomShelfCoverPages>{cover.pagesLabel}</RoomShelfCoverPages>
      </RoomShelfCoverOpen>
      <RoomShelfCoverSave type="button" onClick={() => books.save(cover.id)} aria-label={cover.saveLabel} title={cover.saveLabel}>
        <DownloadIcon />
        {cover.saveLabel}
      </RoomShelfCoverSave>
    </RoomShelfCoverRoot>
  );
});
