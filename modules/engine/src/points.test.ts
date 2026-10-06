import { expect, test } from 'vitest';
import { pickAwards, rankByScore, tallyPoints, type ScoredPage } from './points.js';

const pages: ScoredPage[] = [
  { id: 'p1', authorId: 'ana', kind: 'sentence', empty: false },
  { id: 'p2', authorId: 'bo', kind: 'drawing', empty: false },
  { id: 'p3', authorId: 'cy', kind: 'sentence', empty: false },
  { id: 'p4', authorId: 'ana', kind: 'drawing', empty: false },
];

test('each like is +1 to the page’s author, and a favourite +3', () => {
  const points = tallyPoints(pages, { p2: ['ana', 'cy'], p3: ['bo'], p4: ['bo'] }, ['p2']);

  expect(Object.fromEntries(points)).toEqual({ ana: 1, bo: 5, cy: 1 });
});

test('likes on your own page don’t count', () => {
  expect(tallyPoints(pages, { p1: ['ana'] }, []).get('ana')).toBe(0);
});

test('points add up across pages and rounds', () => {
  const twoRounds = [...pages, { id: 'p5', authorId: 'cy', kind: 'sentence' as const, empty: false }];

  expect(tallyPoints(twoRounds, { p3: ['ana'], p5: ['ana', 'bo'] }, ['p5']).get('cy')).toBe(6);
});

test('the awards go to the most-liked drawing and sentence, and ties share', () => {
  expect(pickAwards(pages, { p2: ['ana', 'cy'], p4: ['bo', 'cy'], p3: ['bo'] })).toEqual({ drawing: ['p2', 'p4'], line: ['p3'] });
});

test('there is no award without a like', () => {
  expect(pickAwards(pages, { p1: ['ana'] })).toEqual({ drawing: [], line: [] });
});

test('an empty page can be liked, but wins no award', () => {
  const blank: ScoredPage = { id: 'p6', authorId: 'bo', kind: 'sentence', empty: true };

  expect(pickAwards([...pages, blank], { p6: ['ana', 'cy'], p3: ['bo'] })).toEqual({ drawing: [], line: ['p3'] });
  expect(tallyPoints([blank], { p6: ['ana', 'cy'] }, []).get('bo')).toBe(2);
});

test('rankByScore shares places between equal scores', () => {
  const ranked = rankByScore([{ id: 'ana', points: 3 }, { id: 'bo', points: 7 }, { id: 'cy', points: 3 }], (item) => item.points);

  expect(ranked.map(({ item, place }) => [item.id, place])).toEqual([['bo', 1], ['ana', 2], ['cy', 2]]);
});
