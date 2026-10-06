import type { BoardAction, BoardFill, StrokeBatch } from '@telephone-table/protocol';

// The lobby's doodle board (spec D22): the squiggle's seed and everyone's lines on top of it.
// Lines go out to everyone as they're drawn; a new squiggle starts on a clean board.
export class DemoDoodle {
  squiggle: number;
  actions: BoardAction[] = [];

  constructor(seed: number) {
    this.squiggle = seed;
  }

  // Adds the batch to its stroke (or starts one).
  stroke(authorId: string, batch: StrokeBatch): void {
    const existing = this.actions.find((action) => action.kind === 'stroke' && action.id === batch.strokeId);

    if (existing?.kind === 'stroke') {
      existing.points.push(...batch.points);

      return;
    }

    this.actions.push({ kind: 'stroke', id: batch.strokeId, authorId, color: batch.color, size: batch.size, eraser: batch.eraser, points: [...batch.points] });
  }

  fill(authorId: string, fill: BoardFill): void {
    this.actions.push({ kind: 'fill', authorId, ...fill });
  }

  // Takes back the author's last line or fill; returns its id.
  undo(authorId: string): string | null {
    const index = this.actions.findLastIndex((action) => action.authorId === authorId);
    const removed = this.actions[index];

    if (!removed) return null;

    this.actions.splice(index, 1);

    return removed.id;
  }

  reset(seed: number): void {
    this.squiggle = seed;
    this.actions = [];
  }
}
