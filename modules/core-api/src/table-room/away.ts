import type { Schedule } from './lifecycle.js';

export interface TableRoomAwayDeps {
  schedule: Schedule;
  graceMs: number;
  // Someone has now been away long enough to stop holding a step up.
  gone: () => void;
}

// Who has been away too long to hold anyone up (spec §5.4). A reload is back within a second or
// two, so a dropped connection gets a few seconds' grace first: otherwise the last person still
// drawing would lose the rest of their step just by reloading.
export class TableRoomAway {
  readonly #pending = new Map<string, () => void>();
  readonly #gone = new Set<string>();
  readonly #deps: TableRoomAwayDeps;

  constructor(deps: TableRoomAwayDeps) {
    this.#deps = deps;
  }

  isHere(memberId: string): boolean {
    return !this.#gone.has(memberId);
  }

  drop(memberId: string): void {
    this.back(memberId);

    this.#pending.set(
      memberId,
      this.#deps.schedule(() => {
        this.#pending.delete(memberId);
        this.#gone.add(memberId);
        this.#deps.gone();
      }, this.#deps.graceMs),
    );
  }

  // Reconnected, or left for good: either way, nothing to wait for.
  back(memberId: string): void {
    this.#pending.get(memberId)?.();
    this.#pending.delete(memberId);
    this.#gone.delete(memberId);
  }

  dispose(): void {
    this.#pending.forEach((cancel) => cancel());
    this.#pending.clear();
    this.#gone.clear();
  }
}
