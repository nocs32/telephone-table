import { typedText, typingMs } from '@telephone-table/engine';
import { useEffect, useRef, type RefObject } from 'react';

// Types a sentence out at the reveal (from `replayFrom` on), or shows it whole (null). Every screen
// counts from the same moment, like a drawing's time-lapse. It writes to the element directly each
// frame, and marks it while typing so the caret shows.
export const usePageTyping = (text: string, replayFrom: number | null): RefObject<HTMLSpanElement | null> => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) return undefined;

    if (replayFrom === null) {
      element.textContent = text;
      element.dataset.typing = 'false';

      return undefined;
    }

    const durationMs = typingMs(text);
    let frame = 0;

    const type = (): void => {
      const progress = (Date.now() - replayFrom) / durationMs;

      element.textContent = typedText(text, progress);
      element.dataset.typing = String(progress < 1);

      if (progress < 1) frame = requestAnimationFrame(type);
    };

    type();

    return () => cancelAnimationFrame(frame);
  }, [text, replayFrom]);

  return ref;
};
