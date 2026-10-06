import type { BoardAction } from '@telephone-table/protocol';
import { expect, test } from 'vitest';
import { timelapseFrame, timelapseMs } from './timelapse.js';

const stroke = (id: string, pointCount: number): BoardAction => ({
  kind: 'stroke',
  id,
  authorId: 'ana',
  color: 0,
  size: 1,
  eraser: false,
  points: Array.from({ length: pointCount * 2 }, (_, index) => index),
});

const fill: BoardAction = { kind: 'fill', id: 'f', authorId: 'ana', x: 10, y: 10, color: 5 };

test('a time-lapse lasts 4 to 8 seconds, whatever the drawing', () => {
  expect(timelapseMs([])).toBe(4000);
  expect(timelapseMs([stroke('a', 10)])).toBe(4000);
  expect(timelapseMs([stroke('a', 750)])).toBe(6000);
  expect(timelapseMs([stroke('a', 5000)])).toBe(8000);
});

test('the frames grow in order, ending on the whole drawing', () => {
  const drawing = [stroke('a', 40), fill, stroke('b', 40)];

  expect(timelapseFrame(drawing, 0)).toEqual([]);
  expect(timelapseFrame(drawing, 1)).toEqual(drawing);
  expect(timelapseFrame(drawing, 0.5).map((action) => action.id)).toEqual(['a']);
  expect(timelapseFrame(drawing, 0.7).map((action) => action.id)).toEqual(['a', 'f', 'b']);
});

test('the stroke in progress is cut short', () => {
  const frame = timelapseFrame([stroke('a', 100)], 0.25);

  expect(frame).toHaveLength(1);
  expect(frame[0]?.kind === 'stroke' && frame[0].points.length).toBe(50);
});
