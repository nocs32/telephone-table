import { useLayoutEffect, useRef, type RefObject } from 'react';
import type { StickerView } from '../../../stores/room/stickers';

// Puts a sticker where it was stuck, at its tilt, as CSS variables, so it lands in the same place on
// every screen whatever the page's size. Set before the first paint, so it never flashes elsewhere.
export const usePageCardStickersItem = ({ x, y, tilt }: StickerView): RefObject<HTMLSpanElement | null> => {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    ref.current?.style.setProperty('--x', String(x));
    ref.current?.style.setProperty('--y', String(y));
    ref.current?.style.setProperty('--tilt', `${tilt}deg`);
  }, [x, y, tilt]);

  return ref;
};
