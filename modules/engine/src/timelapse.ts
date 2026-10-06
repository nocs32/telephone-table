// The reveal replays each drawing as a short time-lapse (spec §6): 4 to 8 seconds, whatever its
// length, the strokes and fills in the order they were made.
import type { BoardAction } from '@telephone-table/protocol';

const shortestMs = 4000;
const longestMs = 8000;
// Each point takes this long, within the bounds above.
const msPerPoint = 8;
// A fill counts like a short line.
const fillWeight = 20;

const weightOf = (action: BoardAction): number => (action.kind === 'fill' ? fillWeight : action.points.length / 2);

const totalWeight = (actions: readonly BoardAction[]): number => actions.reduce((sum, action) => sum + weightOf(action), 0);

export const timelapseMs = (actions: readonly BoardAction[]): number => Math.min(longestMs, Math.max(shortestMs, totalWeight(actions) * msPerPoint));

// The drawing as it stands `progress` (0–1) of the way through: the finished actions, then the
// start of the stroke in progress.
export const timelapseFrame = (actions: readonly BoardAction[], progress: number): BoardAction[] => {
  let budget = Math.min(1, Math.max(0, progress)) * totalWeight(actions);
  const frame: BoardAction[] = [];

  for (const action of actions) {
    const weight = weightOf(action);

    if (budget >= weight) {
      frame.push(action);
      budget -= weight;
      continue;
    }

    if (action.kind === 'stroke' && budget > 0) frame.push({ ...action, points: action.points.slice(0, Math.max(2, Math.floor(budget) * 2)) });

    break;
  }

  return frame;
};
