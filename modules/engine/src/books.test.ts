import { bookLengths, type PageKind } from '@telephone-table/protocol';
import { expect, test } from 'vitest';
import { bookHeldBy, bookPageCount, holderOf, promptPage, stepKindAt } from './books.js';

const tableSizes = Array.from({ length: 10 }, (_, index) => index + 3);

// The seats that hold a book, page by page.
const holders = (book: number, pages: number, seats: number): number[] => Array.from({ length: pages }, (_, step) => holderOf(book, step, seats));

test('full-length books have a page per player, and one more when that is even', () => {
  expect(tableSizes.map((players) => bookPageCount(players, 'everyone'))).toEqual([3, 5, 5, 7, 7, 9, 9, 11, 11, 13]);
});

test('shorter books are capped at full length, and every length is odd', () => {
  tableSizes.forEach((players) => {
    bookLengths.forEach((length) => {
      const pages = bookPageCount(players, length);

      expect(pages % 2).toBe(1);
      expect(pages).toBeGreaterThanOrEqual(3);
      expect(pages).toBeLessThanOrEqual(bookPageCount(players, 'everyone'));
    });
  });

  expect(bookPageCount(8, 5)).toBe(5);
  expect(bookPageCount(4, 11)).toBe(5);
});

test('every book visits everyone once, starting with its owner', () => {
  tableSizes.forEach((seats) => {
    for (let book = 0; book < seats; book++) {
      const visits = holders(book, seats, seats);

      expect(visits[0]).toBe(book);
      expect(new Set(visits).size).toBe(seats);
    }
  });
});

test('nobody holds a book twice, except an owner writing its last page', () => {
  tableSizes.forEach((seats) => {
    bookLengths.forEach((length) => {
      const pages = bookPageCount(seats, length);

      for (let book = 0; book < seats; book++) {
        const visits = holders(book, pages, seats);
        const repeats = visits.filter((seat, step) => visits.indexOf(seat) !== step);

        expect(repeats.length === 0 || (repeats.length === 1 && visits.at(-1) === book && pages === seats + 1)).toBe(true);
      }
    });
  });
});

test('at every step each seat holds exactly one book', () => {
  tableSizes.forEach((seats) => {
    for (let step = 0; step <= seats; step++) {
      const held = Array.from({ length: seats }, (_, seat) => bookHeldBy(seat, step, seats));

      expect(new Set(held).size).toBe(seats);
      held.forEach((book, seat) => expect(holderOf(book, step, seats)).toBe(seat));
    }
  });
});

test('steps alternate, and every book ends on a sentence', () => {
  expect([0, 1, 2, 3, 4].map(stepKindAt)).toEqual(['write', 'draw', 'write', 'draw', 'write']);
  tableSizes.forEach((players) => bookLengths.forEach((length) => expect(stepKindAt(bookPageCount(players, length) - 1)).toBe('write')));
});

const page = (id: string, kind: PageKind): { id: string; kind: PageKind } => ({ id, kind });

test('a drawer gets the latest sentence and a writer the latest drawing', () => {
  const pages = [page('s1', 'sentence'), page('d1', 'drawing'), page('s2', 'sentence')];

  expect(promptPage(pages, 'draw')?.id).toBe('s2');
  expect(promptPage(pages.slice(0, 2), 'write')?.id).toBe('d1');
  expect(promptPage([], 'write')).toBeNull();
});

test('when someone left, the next person gets the latest page of the other kind', () => {
  // The writer of step 2 left: the drawer of step 3 draws the first sentence again.
  const writerLeft = [page('s1', 'sentence'), page('d1', 'drawing')];

  expect(promptPage(writerLeft, 'draw')?.id).toBe('s1');

  // The drawers of steps 1 and 3 both left: the writers after them have no drawing to describe,
  // and the drawer of step 5 gets the sentence of step 4.
  const drawersLeft = [page('s1', 'sentence'), page('s2', 'sentence')];

  expect(promptPage(drawersLeft, 'write')).toBeNull();
  expect(promptPage([...drawersLeft, page('s3', 'sentence')], 'draw')?.id).toBe('s3');
});
