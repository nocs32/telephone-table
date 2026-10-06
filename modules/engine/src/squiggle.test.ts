import { boardHeight, boardWidth } from '@telephone-table/protocol';
import { expect, test } from 'vitest';
import { makeSquiggle } from './squiggle.js';

const seeds = Array.from({ length: 200 }, (_, index) => index * 7919 + 1);

test('the same seed always gives the same squiggle', () => {
  expect(makeSquiggle(42)).toEqual(makeSquiggle(42));
  expect(makeSquiggle(42)).not.toEqual(makeSquiggle(43));
});

test('a squiggle is one to three curves, each a real line', () => {
  seeds.forEach((seed) => {
    const curves = makeSquiggle(seed);

    expect(curves.length).toBeGreaterThanOrEqual(1);
    expect(curves.length).toBeLessThanOrEqual(3);
    curves.forEach((curve) => expect(curve.points.length).toBeGreaterThan(20));
  });
});

test('a squiggle stays inside the board', () => {
  seeds.forEach((seed) => {
    makeSquiggle(seed).forEach(({ points }) => {
      points.forEach((value, index) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(index % 2 === 0 ? boardWidth : boardHeight);
      });
    });
  });
});
