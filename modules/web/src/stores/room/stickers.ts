import { stickers, stickersPerPage, type Sticker, type StickerSnapshot } from '@telephone-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { SoundsService } from '../../services';
import type { Translate } from '../locale';
import type { RoomGameStore } from './game';
import type { RoomPresenceStore } from './presence';
import type { TableSend } from './types';

export interface StickerView {
  id: string;
  sticker: Sticker;
  // Its centre, from 0 to 1 across the page's drawing or speech bubble.
  x: number;
  y: number;
  // Degrees: every screen tilts it the same way.
  tilt: number;
  // Yours, while the book is still open.
  canPeel: boolean;
  label: string;
}

export interface StickerTrayItem {
  sticker: Sticker;
  isHeld: boolean;
  label: string;
}

// idle ⇄ holding: a sticker picked off the sheet, waiting for a page.
export type RoomStickersState = 'idle' | 'holding';

export interface RoomStickersDeps {
  t: Translate;
  game: RoomGameStore;
  presence: RoomPresenceStore;
  send: TableSend;
  sounds: SoundsService;
}

const maxTilt = 14;

const tiltOf = (id: string): number => {
  const hash = Array.from(id).reduce((sum, letter) => (sum * 31 + (letter.codePointAt(0) ?? 0)) % 100_003, 7);

  return (hash % (maxTilt * 2 + 1)) - maxTilt;
};

const countOf = (record: Readonly<Record<string, StickerSnapshot[]>>): number => Object.values(record).reduce((sum, onPage) => sum + onPage.length, 0);

// A place on the page, kept on it and short on the wire.
const onPage = (value: number): number => Math.round(Math.min(1, Math.max(0, value)) * 1000) / 1000;

// Stickers at the reveal (spec D25): pick one off the sheet, stick it on a turned page of the open
// book, peel your own off again. Everyone's stickers stay on the pages afterwards.
export class RoomStickersStore {
  state: RoomStickersState = 'idle';
  held: Sticker | null = null;
  // The page you last tried already had all of your stickers.
  isPageFull = false;
  readonly #deps: RoomStickersDeps;

  constructor(deps: RoomStickersDeps) {
    this.#deps = deps;
    // viewsOf is read inside the books' computeds, so it stays a plain (tracked) function.
    makeAutoObservable(this, { viewsOf: false }, { autoBind: true });
  }

  get canStick(): boolean {
    return this.#deps.game.state === 'reveal';
  }

  get isHolding(): boolean {
    return this.state === 'holding' && this.canStick;
  }

  get tray(): StickerTrayItem[] {
    return stickers.map((sticker) => ({ sticker, isHeld: this.isHolding && this.held === sticker, label: this.#deps.t('stickers.pick', { sticker }) }));
  }

  // How it works, right on the sheet (spec D23).
  get hint(): string {
    const { t } = this.#deps;

    if (this.isPageFull) return t('stickers.pageFull', { count: stickersPerPage });

    return t(this.isHolding ? 'stickers.holding' : 'stickers.hint');
  }

  viewsOf(pageId: string): StickerView[] {
    const { t, game, presence } = this.#deps;

    return (game.stickers[pageId] ?? []).map(({ id, memberId, sticker, x, y }) => {
      const isMine = memberId === presence.meId;
      const name = presence.find(memberId)?.name;

      return {
        id,
        sticker,
        x,
        y,
        tilt: tiltOf(id),
        canPeel: isMine && this.canStick,
        label: isMine ? t('stickers.yours') : name ? t('stickers.by', { name }) : t('stickers.someone'),
      };
    });
  }

  // A tap on the sheet picks a sticker up, or puts it back.
  pick(sticker: Sticker): void {
    if (this.isHolding && this.held === sticker) this.drop();
    else this.hold(sticker);
  }

  // Dragging one off the sheet holds it, whatever was held before.
  hold(sticker: Sticker): void {
    if (!this.canStick) return;

    this.state = 'holding';
    this.held = sticker;
    this.isPageFull = false;
  }

  drop(): void {
    this.state = 'idle';
    this.held = null;
  }

  stickAt(pageId: string, x: number, y: number): void {
    const sticker = this.held;
    const mine = (this.#deps.game.stickers[pageId] ?? []).filter((placed) => placed.memberId === this.#deps.presence.meId);

    if (!this.isHolding || !sticker) return;

    this.drop();
    this.isPageFull = mine.length >= stickersPerPage;

    if (!this.isPageFull) this.#deps.send('stick', { pageId, sticker, x: onPage(x), y: onPage(y) });
  }

  peel(stickerId: string): void {
    if (this.canStick) this.#deps.send('peel', { stickerId });
  }

  // The table sent new stickers: a slap for each new one, a rip for one peeled off. Outside the
  // reveal nothing can be held.
  receive(before: Readonly<Record<string, StickerSnapshot[]>>): void {
    const change = countOf(this.#deps.game.stickers) - countOf(before);

    if (!this.canStick) {
      this.drop();
      this.isPageFull = false;
    }

    if (change > 0 && this.canStick) this.#deps.sounds.stick();
    else if (change < 0 && this.canStick) this.#deps.sounds.peel();
  }
}
