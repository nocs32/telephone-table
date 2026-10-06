import { autorun } from 'mobx';
import { useEffect, useRef, type RefObject } from 'react';
import type { RoomGameStore } from '../../stores/room/game';

// The clock's ring shrinks as time runs out. It changes four times a second, so it's set as a CSS
// variable rather than through React renders.
export const useRoomClockRing = (game: RoomGameStore): RefObject<HTMLSpanElement | null> => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(
    () =>
      autorun(() => {
        ref.current?.style.setProperty('--left', `${game.timeFraction * 360}deg`);
      }),
    [game],
  );

  return ref;
};
