import type { PageSnapshot } from '@telephone-table/protocol';
import { expect, test } from 'vitest';
import { TableRoomError } from './error.js';
import { TableRoomPoints } from './points.js';
import { TableRoomStickers } from './stickers.js';
import { testSentences } from './test-table.js';

const sentence = (id: string, authorId: string, text: string = testSentences[0]): PageSnapshot => ({
  id,
  bookId: 'b1',
  index: 0,
  kind: 'sentence',
  author: { id: authorId, name: authorId, color: 'sky' },
  text,
  actions: [],
});

const createPoints = (favourites: string[] = []): { points: TableRoomPoints; settings: { on: boolean } } => {
  const settings = { on: true };
  const pages = [sentence('p1', 'a'), sentence('p2', 'b'), sentence('p3', 'c', '')];

  return { points: new TableRoomPoints({ isOn: () => settings.on, pages: () => pages, favourites: () => favourites }), settings };
};

test("a like is +1 to the page's author, one per person, and can be taken back", () => {
  const { points } = createPoints();

  points.like('b', 'p1', true);
  points.like('b', 'p1', true);
  points.like('c', 'p1', true);
  expect(points.tally().get('a')).toBe(2);

  points.like('c', 'p1', false);
  expect(points.likes).toEqual({ p1: ['b'] });
  expect(points.tally().get('a')).toBe(1);
});

test('no likes on your own page, on pages not turned yet, or with points off', () => {
  const { points, settings } = createPoints();

  expect(() => points.like('a', 'p1', true)).toThrow(new TableRoomError('OWN_PAGE'));
  expect(() => points.like('a', 'hidden', true)).toThrow(new TableRoomError('NO_SUCH_PAGE'));
  settings.on = false;
  expect(() => points.like('b', 'p1', true)).toThrow(new TableRoomError('WRONG_PHASE'));
});

test('a favourite is +3, and the awards go to the most-liked pages with something on them', () => {
  const { points } = createPoints(['p2']);

  points.like('a', 'p3', true);
  points.like('b', 'p1', true);
  expect(points.tally().get('b')).toBe(3);
  expect(points.awards()).toEqual({ drawing: [], line: ['p1'] });

  points.reset();
  expect(points.likes).toEqual({});
});

test('stickers: three of yours per open page, peeled off only by you, only while the notebook is open', () => {
  const open = new Set(['p1']);
  let id = 0;
  const stickers = new TableRoomStickers({ isOpenPage: (pageId) => open.has(pageId), createId: () => `s${++id}` });

  ['⭐', '🔥', '👀'].forEach((sticker) => stickers.stick('a', 'p1', sticker as '⭐', 0.5, 0.5));
  expect(() => stickers.stick('a', 'p1', '⭐', 0.5, 0.5)).toThrow(new TableRoomError('STICKERS_USED'));
  expect(() => stickers.stick('b', 'p2', '⭐', 0.5, 0.5)).toThrow(new TableRoomError('NO_SUCH_PAGE'));
  stickers.stick('b', 'p1', '😂', 0.1, 0.9);

  expect(() => stickers.peel('b', 's1')).toThrow(new TableRoomError('NOT_YOUR_STICKER'));
  stickers.peel('a', 's1');
  expect(stickers.record.p1?.map((placed) => placed.id)).toEqual(['s2', 's3', 's4']);

  open.clear();
  expect(() => stickers.peel('a', 's2')).toThrow(new TableRoomError('NO_SUCH_PAGE'));
  expect(stickers.record.p1).toHaveLength(3);
});
