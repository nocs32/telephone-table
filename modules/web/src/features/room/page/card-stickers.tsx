import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { PageView } from '../../../stores/room/books';
import { useRootStore } from '../../../stores/use-root-store';
import { PageCardStickersItem } from './card-stickers-item';
import { PageCardStickersRoot } from './styled-components';

interface PageCardStickersProps {
  page: PageView;
  // The reveal has this page's book open, so new stickers land here (spec D25).
  takesStickers: boolean;
}

// The stickers on a page, over its drawing or speech bubble. Taps go through to the page, except
// while you hold a sticker: then the page catches it.
export const PageCardStickers = observer(function PageCardStickers({ page, takesStickers }: PageCardStickersProps): ReactElement {
  const { stickers } = useRootStore().room;

  return (
    <PageCardStickersRoot data-sticker-target={takesStickers ? page.id : undefined} kind={page.kind} catching={takesStickers && stickers.isHolding}>
      {page.stickers.map((sticker) => (
        <PageCardStickersItem key={sticker.id} sticker={sticker} onPeel={sticker.canPeel ? () => stickers.peel(sticker.id) : undefined} />
      ))}
    </PageCardStickersRoot>
  );
});
