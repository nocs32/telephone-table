import { gameLimits } from '@telephone-table/protocol';
import { expect, test } from 'vitest';
import { limits } from '../limits.js';
import { TableRoomError } from './error.js';
import { createTestGame, finishStep, testBatch, testSentences, type TestGame } from './test-table.js';
import { taskOf, tableView } from './view.js';

const writeSeconds = 40 * 1000;

// Plays every step of the round.
const playRound = (table: TestGame): void => {
  while (table.game.phase === 'step') finishStep(table);
};

// The owners turn every page and move on, picking the first page by someone else as favourite.
const revealAll = ({ game }: TestGame): void => {
  while (game.phase === 'reveal' && game.reveal?.book) {
    const { book } = game.reveal;

    while (!game.reveal.isLastPage) game.turnPage(book.owner.id);

    const favourite = book.pages.find((page) => page.author.id !== book.owner.id);

    if (game.settings.points && favourite) game.favourite(book.owner.id, favourite.id);

    game.nextBook(book.owner.id);
  }
};

test('Start needs three people and the lobby; settings change only in the lobby', () => {
  const table = createTestGame(2);
  const { game, members, feed } = table;

  expect(() => game.start('p0')).toThrow(new TableRoomError('NOT_ENOUGH_PLAYERS'));
  game.updateSettings('p0', { rounds: 9, writeSeconds: 17 });
  expect(game.settings).toMatchObject({ rounds: 5, writeSeconds: 15 });
  expect(feed.items.filter((item) => item.kind === 'system')).toHaveLength(2);

  members.join('p2', 'Player 2');
  game.start('p1');
  expect(game.phase).toBe('step');
  expect(table.starts()).toBe(1);
  expect(() => game.updateSettings('p0', { rounds: 1 })).toThrow(new TableRoomError('WRONG_PHASE'));
  expect(() => game.start('p0')).toThrow(new TableRoomError('WRONG_PHASE'));
});

test('a step ends once everyone is done, and pages move one seat along', () => {
  const table = createTestGame(3);
  const { game } = table;

  game.start('p0');
  finishStep(table);

  expect(game.round?.step).toBe(1);
  expect(taskOf(game, 'p1')).toMatchObject({ kind: 'draw', first: false, ownBook: false, prompt: { kind: 'sentence', text: testSentences[0] } });
});

test('when time runs out, pages go in as they are, a moment after the deadline', () => {
  const table = createTestGame(3);
  const { game, clock } = table;

  game.start('p0');
  game.pages.write('p0', testSentences[1]);
  game.done('p0');
  clock.advance(writeSeconds);
  expect(game.round?.step).toBe(0);
  game.pages.write('p1', testSentences[2]);

  clock.advance(gameLimits.lastBatchMs);
  expect(game.round?.step).toBe(1);
  expect(table.changes()).toBe(1);
  expect(game.round?.books.map((book) => book.pages[0]?.text)).toEqual([testSentences[1], testSentences[2], '']);
});

test('Not done keeps editing; a page changes only while its owner works on it', () => {
  const table = createTestGame(3);
  const { game } = table;

  game.start('p0');
  game.done('p0');
  expect(() => game.pages.write('p0', 'late')).toThrow(new TableRoomError('ALREADY_DONE'));
  game.undone('p0');
  game.pages.write('p0', testSentences[3]);
  expect(() => game.pages.stroke('p0', testBatch('s1'))).toThrow(new TableRoomError('NOT_YOUR_PAGE'));
  expect(game.pages.contentOf('p0').text).toBe(testSentences[3]);
});

test('a reload keeps the step and the draft; a connection gone for longer holds nobody up', () => {
  const table = createTestGame(3);
  const { game, members, clock } = table;

  game.start('p0');
  game.pages.write('p2', testSentences[0]);
  game.done('p0');
  game.done('p1');

  members.drop('p2');
  game.drop('p2');
  clock.advance(1000);
  members.reconnect('p2');
  game.reconnect('p2');
  clock.advance(limits.table.dropGraceMs);
  expect(game.round?.step).toBe(0);
  expect(taskOf(game, 'p2')?.draft.text).toBe(testSentences[0]);

  members.drop('p2');
  game.drop('p2');
  clock.advance(limits.table.dropGraceMs);
  expect(game.round?.step).toBe(1);
  expect(game.round?.books[2]?.pages[0]?.text).toBe(testSentences[0]);
});

test('someone leaving mid-round: fewer than two working skips to the reveal with the pages so far', () => {
  const table = createTestGame(3);
  const { game, members } = table;

  game.start('p0');
  finishStep(table);
  members.leave('p2');
  game.leave('p2');
  expect(game.phase).toBe('step');

  members.leave('p1');
  game.leave('p1');
  expect(game.phase).toBe('reveal');
  expect(game.books.map((book) => book.pages.length)).toEqual([2]);
  expect(game.reveal?.snapshot?.takeover).toBeNull();
});

test('a full game: rounds with a break, a newcomer seated next round, the podium, and play again', () => {
  const table = createTestGame(3);
  const { game, members, clock, turned } = table;

  game.updateSettings('p0', { rounds: 2 });
  game.start('p0');
  playRound(table);
  expect(game.phase).toBe('reveal');

  members.join('p3', 'Player 3');
  game.join();
  expect(game.isSeated('p3')).toBe(false);
  revealAll(table);
  expect(game.phase).toBe('break');
  expect(turned).toHaveLength(9);

  clock.advance(gameLimits.breakSeconds * 1000);
  expect(game.phase).toBe('step');
  expect(game.round?.seats).toHaveLength(4);
  expect(game.round?.pageCount).toBe(5);

  playRound(table);
  revealAll(table);
  expect(game.phase).toBe('podium');
  expect(game.awards).toEqual({ drawing: [], line: [] });
  expect(tableView(members.all, game, 1).members.map((member) => member.points)).toEqual([6, 6, 6, 3]);

  game.playAgain('p0');
  expect(tableView(members.all, game, 1).game).toMatchObject({ phase: 'lobby', round: 0, books: [], likes: {} });
});

test('a break waits for a third person, and Start now skips it', () => {
  const table = createTestGame(3);
  const { game, members } = table;

  game.updateSettings('p0', { rounds: 2, points: false });
  game.start('p0');
  playRound(table);
  revealAll(table);
  members.leave('p2');
  game.leave('p2');
  expect(game.endsAt).toBeNull();
  expect(() => game.startNow('p0')).toThrow(new TableRoomError('NOT_ENOUGH_PLAYERS'));

  members.join('p4', 'Player 4');
  game.join();
  expect(game.endsAt).not.toBeNull();
  game.startNow('p4');
  expect(game.phase).toBe('step');
  expect(game.roundNumber).toBe(2);
});

test('with points off the last reveal goes straight to the shelf', () => {
  const table = createTestGame(3);
  const { game } = table;

  game.updateSettings('p0', { rounds: 1, points: false });
  game.start('p0');
  playRound(table);
  revealAll(table);
  expect(game.phase).toBe('shelf');
  expect(game.awards).toBeNull();
});
