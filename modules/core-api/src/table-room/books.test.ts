import type { AuthorSnapshot } from '@telephone-table/protocol';
import { expect, test } from 'vitest';
import { TableRoomBooks, type TableRoomPageContent } from './books.js';
import { TableRoomError } from './error.js';
import { testSentences } from './test-table.js';

const seat = (id: string): AuthorSnapshot => ({ id, name: id.toUpperCase(), color: 'sky' });

const createBooks = (ids: readonly string[] = ['a', 'b', 'c']): TableRoomBooks => {
  let id = 0;

  return new TableRoomBooks({ round: 1, seats: ids.map(seat), length: 'everyone', createId: () => `id${++id}` });
};

const written = (memberId: string): TableRoomPageContent => ({ text: ` ${testSentences[0]} by ${memberId} `, actions: [] });

test('notebooks move one seat along each step, and each holder responds to the latest page of the other kind', () => {
  const books = createBooks();

  expect(books.pageCount).toBe(3);
  expect(books.kind).toBe('write');
  expect(books.promptOf('a')).toBeNull();

  books.lock(written);

  expect(books.kind).toBe('draw');
  expect(books.bookOf('b')?.owner.id).toBe('a');
  expect(books.promptOf('b')).toMatchObject({ kind: 'sentence', text: `${testSentences[0]} by a`, author: { id: 'a' } });
});

test('Done and Not done count only for people working; all done ignores dropped connections', () => {
  const books = createBooks();
  const connected = new Set(['a', 'b']);

  books.markDone('a');
  expect(books.allDone((id) => connected.has(id))).toBe(false);
  books.markDone('b');
  expect(books.allDone((id) => connected.has(id))).toBe(true);
  books.markUndone('b');
  expect(books.isDone('b')).toBe(false);
  expect(() => books.markDone('stranger')).toThrow(new TableRoomError('NOT_YOUR_PAGE'));
});

test('a page changes only in its own kind of step, and not after Done', () => {
  const books = createBooks();

  expect(() => books.permit('a', 'write')).not.toThrow();
  expect(() => books.permit('a', 'draw')).toThrow(new TableRoomError('NOT_YOUR_PAGE'));
  books.markDone('a');
  expect(() => books.permit('a', 'write')).toThrow(new TableRoomError('ALREADY_DONE'));
});

test("a leaver's page in that step goes in, their later pages are skipped, and their notebook carries on", () => {
  const books = createBooks(['a', 'b', 'c', 'd']);

  books.leave('b');
  expect(books.working).toEqual(['a', 'c', 'd']);
  books.lock(written);

  // b's page one is in; in step 1 b would hold a's book, which gets no drawing.
  expect(books.books.map((book) => book.pages.length)).toEqual([1, 1, 1, 1]);
  books.lock(() => ({ text: '', actions: [] }));
  expect(books.books.map((book) => book.pages.length)).toEqual([1, 2, 2, 2]);

  // In step 2, c writes in a's book: its latest drawing is missing, so there's nothing to describe.
  expect(books.bookOf('c')?.owner.id).toBe('a');
  expect(books.promptOf('c')).toBeNull();
});

test('pages keep their author, place and kind; sentences are trimmed', () => {
  const books = createBooks();

  books.lock(written);
  books.lock((memberId) => ({ text: 'ignored', actions: [{ kind: 'fill', id: `f-${memberId}`, authorId: memberId, x: 1, y: 1, color: 2 }] }));

  const [first, second] = books.books[0]?.pages ?? [];

  expect(first).toMatchObject({ index: 0, kind: 'sentence', text: `${testSentences[0]} by a`, actions: [], author: { id: 'a', name: 'A' } });
  expect(second).toMatchObject({ index: 1, kind: 'drawing', text: '', author: { id: 'b' } });
  expect(second?.actions).toHaveLength(1);
});
