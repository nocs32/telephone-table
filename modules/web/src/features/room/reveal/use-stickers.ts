import { stickers as stickerSet, type Sticker } from '@telephone-table/protocol';
import { useEffect, useRef, type RefObject } from 'react';
import type { RoomStickersStore } from '../../../stores/room/stickers';

// How far a press on the sheet travels before it's a drag (less is a tap).
const dragThreshold = 6;

interface Press {
  sticker: Sticker;
  x: number;
  y: number;
  isDragging: boolean;
}

// The press on the sheet in progress, if any.
interface Gesture {
  press: Press | null;
}

type GhostRef = RefObject<HTMLDivElement | null>;

const isSticker = (value: string | undefined): value is Sticker => (stickerSet as readonly string[]).includes(value ?? '');

const pressOn = (event: PointerEvent): Press | null => {
  const sticker = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-sticker]')?.dataset.sticker : undefined;

  return isSticker(sticker) && event.button === 0 ? { sticker, x: event.clientX, y: event.clientY, isDragging: false } : null;
};

// Sticks the held sticker on the page under a point, where it is from 0 to 1 across it, or puts it
// back if there's no page there. While a sticker is held the pages' sticker layers catch the
// pointer, so whatever lies on top of a page (the header, the buttons) still wins.
const land = (stickers: RoomStickersStore, x: number, y: number): boolean => {
  const target = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-sticker-target]');
  const pageId = target?.dataset.stickerTarget;

  if (!target || !pageId) {
    stickers.drop();

    return false;
  }

  const box = target.getBoundingClientRect();

  stickers.stickAt(pageId, (x - box.left) / box.width, (y - box.top) / box.height);

  return true;
};

// A drag ends with a click on whatever is under the pointer; that one shouldn't count too.
const swallowNextClick = (): void => {
  const swallow = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
  };

  window.addEventListener('click', swallow, { capture: true, once: true });
  window.setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
};

// The held sticker follows a mouse, or a finger while it drags.
const follow = (ghostRef: GhostRef, gesture: Gesture, event: PointerEvent): void => {
  ghostRef.current?.style.setProperty('--ghost-x', `${event.clientX}px`);
  ghostRef.current?.style.setProperty('--ghost-y', `${event.clientY}px`);
  ghostRef.current?.setAttribute('data-tracking', String(event.pointerType === 'mouse' || gesture.press?.isDragging === true));
};

const move = (stickers: RoomStickersStore, gesture: Gesture, event: PointerEvent): void => {
  const press = gesture.press;

  if (press && !press.isDragging && Math.hypot(event.clientX - press.x, event.clientY - press.y) >= dragThreshold) {
    press.isDragging = true;
    stickers.hold(press.sticker);
  }
};

const release = (stickers: RoomStickersStore, gesture: Gesture, event: PointerEvent): void => {
  if (gesture.press?.isDragging) {
    land(stickers, event.clientX, event.clientY);
    swallowNextClick();
  }

  gesture.press = null;
};

// While one is held: a tap on a page sticks it there, a tap anywhere else but the sheet puts it back.
const tap = (stickers: RoomStickersStore, event: MouseEvent): void => {
  if (!stickers.isHolding || !(event.target instanceof Element) || event.target.closest('[data-sticker]')) return;

  if (land(stickers, event.clientX, event.clientY)) {
    event.preventDefault();
    event.stopPropagation();
  }
};

const listen = (stickers: RoomStickersStore, ghostRef: GhostRef): (() => void) => {
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const gesture: Gesture = { press: null };

  window.addEventListener(
    'pointerdown',
    (event) => {
      gesture.press = pressOn(event);
    },
    options,
  );

  window.addEventListener(
    'pointermove',
    (event) => {
      move(stickers, gesture, event);
      follow(ghostRef, gesture, event);
    },
    options,
  );

  window.addEventListener(
    'pointerup',
    (event) => {
      release(stickers, gesture, event);
      follow(ghostRef, gesture, event);
    },
    options,
  );

  window.addEventListener(
    'pointercancel',
    () => {
      if (gesture.press?.isDragging) stickers.drop();

      gesture.press = null;
    },
    options,
  );

  window.addEventListener('click', (event) => tap(stickers, event), { ...options, capture: true });
  window.addEventListener('keydown', (event) => event.key === 'Escape' && stickers.drop(), options);

  return () => controller.abort();
};

// Pointer work for the sticker sheet: what MobX can't see (where the pointer is, which page lies
// under it) turns into the stickers store's actions.
export const useRoomRevealStickers = (stickers: RoomStickersStore): GhostRef => {
  const ghostRef = useRef<HTMLDivElement>(null);

  useEffect(() => listen(stickers, ghostRef), [stickers]);

  return ghostRef;
};
