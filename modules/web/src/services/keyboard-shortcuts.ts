import type { RootStore } from '../stores';

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && target.closest('input, textarea, [contenteditable="true"]') !== null;

// The board's keys (B, E, F, 1–4, Ctrl/Cmd+Z), on the doodle board in the lobby and on your page
// while you draw. Ignored while typing in a field. Started once in index.tsx; returns a function
// that stops it.
export const startKeyboardShortcuts = (store: RootStore): (() => void) => {
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.altKey || isTyping(event.target)) return;

    if (store.room.activeBoard?.pressKey(event.key, event.ctrlKey || event.metaKey)) event.preventDefault();
  };

  window.addEventListener('keydown', onKeyDown);

  return () => window.removeEventListener('keydown', onKeyDown);
};
