import { decodeDrawing } from '@telephone-table/engine';
import { expect, test } from 'vitest';
import { TableRoomDoodle } from './doodle.js';
import { TableRoomError } from './error.js';
import { testBatch } from './test-table.js';

const createDoodle = (): { doodle: TableRoomDoodle; table: { lobby: boolean } } => {
  const table = { lobby: true };
  let seed = 0.1;

  const doodle = new TableRoomDoodle({
    caps: { maxActions: 10, maxPoints: 100 },
    random: () => (seed += 0.1),
    isLobby: () => table.lobby,
  });

  return { doodle, table };
};

test('everyone draws on the board in the lobby, and undo takes back only your own line', () => {
  const { doodle } = createDoodle();

  expect(doodle.stroke('a', testBatch('s1'))).toMatchObject({ type: 'stroke', authorId: 'a' });
  doodle.fill('b', { id: 'f1', x: 1, y: 1, color: 3 });
  expect(doodle.undo('a')).toEqual({ type: 'undo', id: 's1' });
  expect(decodeDrawing(doodle.encode()).map((action) => action.id)).toEqual(['f1']);
});

test('a new squiggle starts on a clean board; outside the lobby the board takes nothing', () => {
  const { doodle, table } = createDoodle();
  const first = doodle.squiggle;

  doodle.stroke('a', testBatch('s1'));
  doodle.roll();
  expect(doodle.squiggle).not.toBe(first);
  expect(decodeDrawing(doodle.encode())).toEqual([]);

  table.lobby = false;
  expect(() => doodle.stroke('a', testBatch('s2'))).toThrow(new TableRoomError('WRONG_PHASE'));
  expect(() => doodle.roll()).toThrow(new TableRoomError('WRONG_PHASE'));
});
