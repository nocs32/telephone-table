// The table's settings (spec §5.1): a change from anyone at the table, kept within the limits.
import { bookLengths, gameLimits, type BookLength, type GameSettingKey, type GameSettings } from '@telephone-table/protocol';

interface Range {
  min: number;
  max: number;
  step?: number;
}

const clamp = (value: number, { min, max, step = 1 }: Range): number => Math.min(max, Math.max(min, Math.round(value / step) * step));

const isBookLength = (value: unknown): value is BookLength => (bookLengths as readonly unknown[]).includes(value);

export const applySettings = (current: GameSettings, patch: Partial<GameSettings>): GameSettings => ({
  rounds: clamp(patch.rounds ?? current.rounds, gameLimits.rounds),
  writeSeconds: clamp(patch.writeSeconds ?? current.writeSeconds, gameLimits.writeSeconds),
  drawSeconds: clamp(patch.drawSeconds ?? current.drawSeconds, gameLimits.drawSeconds),
  bookLength: isBookLength(patch.bookLength) ? patch.bookLength : current.bookLength,
  points: patch.points ?? current.points,
});

const settingKeys: readonly GameSettingKey[] = ['rounds', 'writeSeconds', 'drawSeconds', 'bookLength', 'points'];

// Which settings differ, in a fixed order (one feed line each).
export const changedSettings = (before: GameSettings, after: GameSettings): GameSettingKey[] => settingKeys.filter((key) => before[key] !== after[key]);
