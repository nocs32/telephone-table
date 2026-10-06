import { stickersPerPage, type Sticker, type StickerSnapshot } from '@telephone-table/protocol';

// The stickers on the pages (spec D25): each person sticks at most stickersPerPage on one page, and
// peels off only their own. DemoGame decides when and where sticking is allowed.
export class DemoStickers {
  #byPage = new Map<string, StickerSnapshot[]>();
  readonly #createId: () => string;

  constructor(createId: () => string) {
    this.#createId = createId;
  }

  get record(): Record<string, StickerSnapshot[]> {
    return Object.fromEntries(this.#byPage);
  }

  pageOf(stickerId: string): string | null {
    return [...this.#byPage].find(([, onPage]) => onPage.some((placed) => placed.id === stickerId))?.[0] ?? null;
  }

  stick(memberId: string, pageId: string, sticker: Sticker, x: number, y: number): boolean {
    const onPage = this.#byPage.get(pageId) ?? [];

    if (onPage.filter((placed) => placed.memberId === memberId).length >= stickersPerPage) return false;

    this.#byPage.set(pageId, [...onPage, { id: this.#createId(), memberId, sticker, x, y }]);

    return true;
  }

  peel(memberId: string, stickerId: string): boolean {
    const pageId = this.pageOf(stickerId);
    const onPage = this.#byPage.get(pageId ?? '') ?? [];

    if (pageId === null || !onPage.some((placed) => placed.id === stickerId && placed.memberId === memberId)) return false;

    this.#byPage.set(
      pageId,
      onPage.filter((placed) => placed.id !== stickerId),
    );

    return true;
  }

  clear(): void {
    this.#byPage = new Map();
  }
}
