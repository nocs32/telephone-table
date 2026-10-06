// Stickers at the reveal (spec D25): everyone sticks them on the open book's pages, just for fun.
// They stay on the page, and never count for points.

export const stickers = ['⭐', '😂', '😍', '🤯', '🤔', '❓', '🔥', '👀', '🏆', '💀'] as const;

export type Sticker = (typeof stickers)[number];

// How many one person may stick on one page.
export const stickersPerPage = 3;

export interface StickerSnapshot {
  id: string;
  // Who stuck it.
  memberId: string;
  sticker: Sticker;
  // Its centre, from 0 to 1 across the page's drawing or speech bubble.
  x: number;
  y: number;
}
