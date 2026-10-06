import type { ReactElement } from 'react';
import type { StickerView } from '../../../stores/room/stickers';
import { PageCardStickersItemPeel, PageCardStickersItemRoot } from './styled-components';
import { usePageCardStickersItem } from './use-card-stickers-item';

interface PageCardStickersItemProps {
  sticker: StickerView;
  // Yours, while the book is open: a tap peels it off.
  onPeel?: () => void;
}

// One sticker, where it was stuck and at its tilt.
export function PageCardStickersItem({ sticker, onPeel }: PageCardStickersItemProps): ReactElement {
  const ref = usePageCardStickersItem(sticker);

  return (
    <PageCardStickersItemRoot ref={ref} title={sticker.label} role={onPeel ? undefined : 'img'} aria-label={onPeel ? undefined : sticker.label}>
      {onPeel ? (
        <PageCardStickersItemPeel type="button" aria-label={sticker.label} onClick={onPeel}>
          {sticker.sticker}
        </PageCardStickersItemPeel>
      ) : (
        sticker.sticker
      )}
    </PageCardStickersItemRoot>
  );
}
