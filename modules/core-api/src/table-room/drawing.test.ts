import { decodeDrawing } from '@telephone-table/engine';
import type { StrokeBatch } from '@telephone-table/protocol';
import { expect, test } from 'vitest';
import { TableRoomDrawing } from './drawing.js';
import { TableRoomError } from './error.js';

const batch = (strokeId: string, points: number[]): StrokeBatch => ({ strokeId, color: 1, size: 2, eraser: false, points });

const createDrawing = (maxActions = 10, maxPoints = 100): TableRoomDrawing => new TableRoomDrawing({ maxActions, maxPoints });

test('batches of one stroke join up, in half board units', () => {
  const drawing = createDrawing();

  drawing.stroke('ana', batch('s1', [10, 10]));
  const op = drawing.stroke('ana', batch('s1', [20.3, 20.74]));

  expect(op).toEqual({ type: 'stroke', authorId: 'ana', batch: batch('s1', [20.5, 20.5]) });
  expect(drawing.actions).toEqual([{ kind: 'stroke', id: 's1', authorId: 'ana', color: 1, size: 2, eraser: false, points: [10, 10, 20.5, 20.5] }]);
});

test("nobody adds to someone else's stroke or reuses an id", () => {
  const drawing = createDrawing();

  drawing.stroke('ana', batch('s1', [1, 1]));
  drawing.fill('ana', { id: 'f1', x: 1, y: 1, color: 2 });

  expect(() => drawing.stroke('bo', batch('s1', [2, 2]))).toThrow(new TableRoomError('TAKEN_ID'));
  expect(() => drawing.stroke('ana', batch('f1', [2, 2]))).toThrow(new TableRoomError('TAKEN_ID'));
  expect(() => drawing.fill('bo', { id: 's1', x: 1, y: 1, color: 2 })).toThrow(new TableRoomError('TAKEN_ID'));
});

test("undo takes back only the person's own last action", () => {
  const drawing = createDrawing();

  drawing.stroke('ana', batch('s1', [1, 1]));
  drawing.stroke('bo', batch('s2', [2, 2]));

  expect(drawing.undo('ana')).toEqual({ type: 'undo', id: 's1' });
  expect(drawing.actions.map((action) => action.id)).toEqual(['s2']);
  expect(() => drawing.undo('ana')).toThrow(new TableRoomError('NOTHING_TO_UNDO'));
});

test('a full board refuses more, and undo makes room again', () => {
  const drawing = createDrawing(2, 3);

  drawing.stroke('ana', batch('s1', [1, 1, 2, 2]));
  expect(() => drawing.stroke('ana', batch('s1', [3, 3, 4, 4]))).toThrow(new TableRoomError('PAGE_FULL'));
  drawing.fill('ana', { id: 'f1', x: 1, y: 1, color: 2 });
  expect(() => drawing.fill('ana', { id: 'f2', x: 1, y: 1, color: 2 })).toThrow(new TableRoomError('PAGE_FULL'));

  drawing.undo('ana');
  drawing.undo('ana');
  expect(() => drawing.stroke('ana', batch('s3', [1, 1, 2, 2, 3, 3]))).not.toThrow();
});

test('the bytes give back exactly what was drawn, and reset blanks it', () => {
  const drawing = createDrawing();

  drawing.stroke('ana', batch('s1', [1, 1, 2.5, 2]));
  drawing.fill('bo', { id: 'f1', x: 3.2, y: 4, color: 5 });

  expect(decodeDrawing(drawing.encode())).toEqual(drawing.actions);

  drawing.reset();
  expect(drawing.actions).toEqual([]);
});
