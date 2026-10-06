import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import {
  RoomRevealStickersGhost,
  RoomRevealStickersGrid,
  RoomRevealStickersHint,
  RoomRevealStickersItem,
  RoomRevealStickersRoot,
  RoomRevealStickersTitle,
} from './styled-components';
import { useRoomRevealStickers } from './use-stickers';

// The sheet of stickers beside the open book (spec D25): drag one onto a page, or tap it and then
// the page. The sheet says how (spec D23), and a held sticker follows the pointer until it lands.
export const RoomRevealStickers = observer(function RoomRevealStickers(): ReactElement {
  const { locale, room } = useRootStore();
  const { stickers } = room;
  const ghostRef = useRoomRevealStickers(stickers);

  return (
    <>
      <RoomRevealStickersRoot>
        <RoomRevealStickersTitle>{locale.t('stickers.title')}</RoomRevealStickersTitle>
        <RoomRevealStickersGrid>
          {stickers.tray.map((item) => (
            <RoomRevealStickersItem
              key={item.sticker}
              type="button"
              data-sticker={item.sticker}
              isHeld={item.isHeld}
              aria-pressed={item.isHeld}
              aria-label={item.label}
              title={item.label}
              onClick={() => stickers.pick(item.sticker)}
            >
              {item.sticker}
            </RoomRevealStickersItem>
          ))}
        </RoomRevealStickersGrid>
        <RoomRevealStickersHint aria-live="polite">{stickers.hint}</RoomRevealStickersHint>
      </RoomRevealStickersRoot>
      <RoomRevealStickersGhost ref={ghostRef} shown={stickers.isHolding} aria-hidden>
        {stickers.held}
      </RoomRevealStickersGhost>
    </>
  );
});
