import { defaultGameSettings, type GameSettings } from '@telephone-table/protocol';
import { expect, test } from 'vitest';
import { applySettings, changedSettings } from './settings.js';

test('numbers are clamped and rounded to their steps', () => {
  const settings = applySettings(defaultGameSettings, { rounds: 99, writeSeconds: 33, drawSeconds: 44 });

  expect([settings.rounds, settings.writeSeconds, settings.drawSeconds]).toEqual([5, 35, 40]);
  expect(applySettings(defaultGameSettings, { rounds: 0, writeSeconds: 1, drawSeconds: 5000 })).toMatchObject({ rounds: 1, writeSeconds: 15, drawSeconds: 180 });
});

test('book length takes only the lengths on offer', () => {
  expect(applySettings(defaultGameSettings, { bookLength: 7 }).bookLength).toBe(7);
  expect(applySettings(defaultGameSettings, { bookLength: 4 as GameSettings['bookLength'] }).bookLength).toBe('everyone');
});

test('changes are listed in a fixed order', () => {
  const after = applySettings(defaultGameSettings, { points: false, rounds: 5, bookLength: 3 });

  expect(changedSettings(defaultGameSettings, after)).toEqual(['rounds', 'bookLength', 'points']);
  expect(changedSettings(after, after)).toEqual([]);
});
