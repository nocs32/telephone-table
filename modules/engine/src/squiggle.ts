// The lobby doodle board's squiggle (spec D22): a few random curves, unfinished on purpose, made
// up from a seed. Only the seed travels, and every browser draws the same squiggle from it.
import { boardHeight, boardWidth, inkColors, type StrokeAction } from '@telephone-table/protocol';
import { createRandom, randomBetween } from './random.js';

type Point = [number, number];

// Room kept free around the edges, so there's space to draw around the squiggle.
const margin = 110;
const samplesPerSegment = 14;

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value));

const half = (value: number): number => Math.round(value * 2) / 2;

// A wandering path: each control point turns a little from the last and moves on.
const controlPoints = (random: () => number): Point[] => {
  const count = 4 + Math.floor(random() * 3);
  const points: Point[] = [[randomBetween(random, margin, boardWidth - margin), randomBetween(random, margin, boardHeight - margin)]];
  let heading = random() * Math.PI * 2;

  while (points.length < count) {
    const [x, y] = points.at(-1) ?? [0, 0];
    const step = randomBetween(random, 70, 170);

    heading += randomBetween(random, -1.9, 1.9);
    points.push([clamp(x + Math.cos(heading) * step, margin, boardWidth - margin), clamp(y + Math.sin(heading) * step, margin, boardHeight - margin)]);
  }

  return points;
};

// Catmull-Rom between p1 and p2, `t` from 0 to 1.
const between = ([p0, p1, p2, p3]: Point[], t: number, axis: 0 | 1): number => {
  const [a, b, c, d] = [p0?.[axis] ?? 0, p1?.[axis] ?? 0, p2?.[axis] ?? 0, p3?.[axis] ?? 0];

  return 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
};

// A smooth line through the control points, as x, y pairs.
const smooth = (controls: readonly Point[]): number[] => {
  const padded = [controls[0], ...controls, controls.at(-1)].filter((point) => point !== undefined);
  const out: number[] = [];

  for (let segment = 0; segment + 3 < padded.length; segment++) {
    const window = padded.slice(segment, segment + 4);

    for (let sample = segment === 0 ? 0 : 1; sample <= samplesPerSegment; sample++) {
      const t = sample / samplesPerSegment;

      out.push(half(clamp(between(window, t, 0), 0, boardWidth)), half(clamp(between(window, t, 1), 0, boardHeight)));
    }
  }

  return out;
};

const ink = inkColors.indexOf('black');

// One to three curves in black, brush size 2.
export const makeSquiggle = (seed: number): StrokeAction[] => {
  const random = createRandom(seed);
  const curves = 1 + Math.floor(random() * 3);

  return Array.from({ length: curves }, (_, index) => ({
    kind: 'stroke',
    id: `squiggle-${index}`,
    authorId: 'squiggle',
    color: ink,
    size: 1,
    eraser: false,
    points: smooth(controlPoints(random)),
  }));
};
