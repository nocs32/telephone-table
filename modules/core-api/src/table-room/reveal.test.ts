import { gameLimits, type PageSnapshot } from '@telephone-table/protocol';
import { expect, test } from 'vitest';
import type { TableRoomBook } from './books.js';
import { TableRoomError } from './error.js';
import { TableRoomReveal } from './reveal.js';
import { TestClock, testSentences } from './test-table.js';

const page = (bookId: string, index: number, authorId: string): PageSnapshot => ({
  id: `${bookId}-${index}`,
  bookId,
  index,
  kind: index % 2 === 0 ? 'sentence' : 'drawing',
  author: { id: authorId, name: authorId, color: 'sky' },
  text: index % 2 === 0 ? (testSentences[index] ?? '') : '',
  actions: [],
});

const book = (id: string, ownerId: string, authorIds: readonly string[]): TableRoomBook => ({
  id,
  round: 1,
  owner: { id: ownerId, name: ownerId, color: 'sky' },
  pages: authorIds.map((authorId, index) => page(id, index, authorId)),
  favouritePageId: null,
});

interface Harness {
  reveal: TableRoomReveal;
  clock: TestClock;
  turned: string[];
  opened: string[];
  here: Set<string>;
  points: { on: boolean };
}

const createReveal = (): Harness => {
  const clock = new TestClock();
  const turned: string[] = [];
  const opened: string[] = [];
  const here = new Set(['a', 'b', 'c']);
  const points = { on: true };

  const reveal = new TableRoomReveal([book('A', 'a', ['a', 'b', 'c']), book('B', 'b', ['b', 'c', 'a'])], {
    now: () => clock.now,
    schedule: clock.schedule,
    pointsOn: () => points.on,
    isHere: (id) => here.has(id),
    opened: (opening) => opened.push(opening.id),
    turned: (turning) => turned.push(turning.id),
    changed: () => undefined,
  });

  return { reveal, clock, turned, opened, here, points };
};

test('the owner turns the pages, one at a time, and each goes out as it turns', () => {
  const { reveal, turned, opened } = createReveal();

  reveal.open();
  expect(opened).toEqual(['A']);
  expect(turned).toEqual(['A-0']);
  expect(() => reveal.turnPage('b')).toThrow(new TableRoomError('NOT_BOOK_OWNER'));

  reveal.turnPage('a');
  reveal.turnPage('a');
  expect(turned).toEqual(['A-0', 'A-1', 'A-2']);
  expect(reveal.turnedPages.map((turning) => turning.id)).toEqual(['A-0', 'A-1', 'A-2']);
  expect(() => reveal.turnPage('a')).toThrow(new TableRoomError('NO_SUCH_PAGE'));
});

test('a page left unturned for 20 seconds lets everyone turn', () => {
  const { reveal, clock } = createReveal();

  reveal.open();
  clock.advance(gameLimits.ownerIdleSeconds * 1000 - 1);
  expect(reveal.snapshot?.takeover).toBeNull();
  clock.advance(1);
  expect(reveal.snapshot?.takeover).toBe('idle');
  expect(() => reveal.turnPage('c')).not.toThrow();
});

test('the owner leaving lets everyone turn, and skips the favourite', () => {
  const { reveal } = createReveal();

  reveal.open();
  reveal.ownerLeft('a');
  reveal.turnPage('b');
  reveal.turnPage('c');
  expect(reveal.nextBook('b')).toBe(true);
  expect(reveal.book?.id).toBe('B');
  expect(reveal.snapshot).toMatchObject({ bookIndex: 1, shown: 1, takeover: null });
});

test("the owner picks a favourite by someone else before the next notebook; it's skipped with points off", () => {
  const harness = createReveal();
  const { reveal } = harness;

  reveal.open();
  expect(() => reveal.favourite('a', 'A-1')).toThrow(new TableRoomError('WRONG_PHASE'));
  reveal.turnPage('a');
  reveal.turnPage('a');
  expect(() => reveal.nextBook('a')).toThrow(new TableRoomError('WRONG_PHASE'));
  expect(() => reveal.favourite('b', 'A-1')).toThrow(new TableRoomError('NOT_BOOK_OWNER'));
  expect(() => reveal.favourite('a', 'A-0')).toThrow(new TableRoomError('OWN_PAGE'));
  expect(() => reveal.favourite('a', 'B-1')).toThrow(new TableRoomError('NO_SUCH_PAGE'));

  reveal.favourite('a', 'A-1');
  expect(reveal.book?.favouritePageId).toBe('A-1');
  expect(reveal.nextBook('a')).toBe(true);

  harness.points.on = false;
  reveal.turnPage('b');
  reveal.turnPage('b');
  expect(reveal.nextBook('b')).toBe(false);
});

test('a notebook whose owner is gone opens with the takeover', () => {
  const { reveal, here } = createReveal();

  here.delete('a');
  reveal.open();
  expect(reveal.snapshot?.takeover).toBe('left');
});

test('only the open notebook’s turned pages take stickers', () => {
  const { reveal } = createReveal();

  reveal.open();
  expect(reveal.isOpenPage('A-0')).toBe(true);
  expect(reveal.isOpenPage('A-1')).toBe(false);
  expect(reveal.isOpenPage('B-0')).toBe(false);
});
