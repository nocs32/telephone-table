import { stickersPerPage, type Sticker, type StickerSnapshot } from '@telephone-table/protocol';
import { TableRoomError } from './error.js';

export interface TableRoomStickersDeps {
  // A turned page of the book that's open at the reveal: the only pages that take stickers.
  isOpenPage: (pageId: string) => boolean;
  createId: () => string;
}

// The stickers on the pages (spec D25): each person sticks at most stickersPerPage on one page, only
// while its book is open, and peels off only their own. They stay on afterwards, for the shelf.
export class TableRoomStickers {
  #byPage = new Map<string, StickerSnapshot[]>();
  readonly #deps: TableRoomStickersDeps;

  constructor(deps: TableRoomStickersDeps) {
    this.#deps = deps;
  }

  get record(): Record<string, StickerSnapshot[]> {
    return Object.fromEntries([...this.#byPage].filter(([, onPage]) => onPage.length > 0));
  }

  stick(memberId: string, pageId: string, sticker: Sticker, x: number, y: number): void {
    const onPage = this.#byPage.get(pageId) ?? [];

    if (!this.#deps.isOpenPage(pageId)) throw new TableRoomError('NO_SUCH_PAGE');

    if (onPage.filter((placed) => placed.memberId === memberId).length >= stickersPerPage) throw new TableRoomError('STICKERS_USED');

    this.#byPage.set(pageId, [...onPage, { id: this.#deps.createId(), memberId, sticker, x, y }]);
  }

  peel(memberId: string, stickerId: string): void {
    const [pageId, onPage] = [...this.#byPage].find(([, placed]) => placed.some((candidate) => candidate.id === stickerId)) ?? [];
    const sticker = onPage?.find((candidate) => candidate.id === stickerId);

    if (!pageId || !onPage || !sticker || !this.#deps.isOpenPage(pageId)) throw new TableRoomError('NO_SUCH_PAGE');

    if (sticker.memberId !== memberId) throw new TableRoomError('NOT_YOUR_STICKER');

    this.#byPage.set(
      pageId,
      onPage.filter((candidate) => candidate !== sticker),
    );
  }

  // A new game.
  reset(): void {
    this.#byPage = new Map();
  }
}
