import { useEffect, useRef, type RefObject } from 'react';

// Keeps the newest page in view as pages are turned.
export const useRoomRevealThreadScroll = (pageCount: number): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  }, [pageCount]);

  return ref;
};
