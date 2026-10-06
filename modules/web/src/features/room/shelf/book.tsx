import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CloseIcon, DownloadIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button, IconButton } from '../../../ui';
import { PageCard } from '../page';
import { RoomShelfBookBackdrop, RoomShelfBookContent, RoomShelfBookHeader, RoomShelfBookPages, RoomShelfBookPositioner, RoomShelfBookTitle } from './styled-components';

// An open book from the shelf: every page, hearts included, and Save (spec D24).
export const RoomShelfBook = observer(function RoomShelfBook(): ReactElement | null {
  const { locale, room } = useRootStore();
  const { shelf, books } = room;
  const book = shelf.openBook;

  if (!book) return null;

  return (
    <Dialog.Root open onOpenChange={(details) => !details.open && shelf.close()}>
      <Portal>
        <RoomShelfBookBackdrop />
        <RoomShelfBookPositioner>
          <RoomShelfBookContent>
            <RoomShelfBookHeader>
              <Dialog.Title asChild>
                <RoomShelfBookTitle>{book.cover.title}</RoomShelfBookTitle>
              </Dialog.Title>
              <Button tone="secondary" size="sm" type="button" onClick={() => books.save(book.cover.id)}>
                <DownloadIcon />
                {book.cover.saveLabel}
              </Button>
              <Dialog.CloseTrigger asChild>
                <IconButton type="button" aria-label={locale.t('shelf.close')}>
                  <CloseIcon />
                </IconButton>
              </Dialog.CloseTrigger>
            </RoomShelfBookHeader>
            <RoomShelfBookPages>
              {book.pages.map((page, index) => (
                <PageCard key={page.id} page={page} tilt={index % 4 === 1 ? 'left' : 'right'} />
              ))}
            </RoomShelfBookPages>
          </RoomShelfBookContent>
        </RoomShelfBookPositioner>
      </Portal>
    </Dialog.Root>
  );
});
