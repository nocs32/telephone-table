import type { PageSnapshot, StrokeBatch } from '@telephone-table/protocol';
import { TableRoomFeed } from './feed.js';
import { TableRoomGame } from './game.js';
import type { Schedule } from './lifecycle.js';
import { TableRoomMembers } from './members.js';

// Made-up sentences for the tests (they avoid Scribble Table's word lists, see CLAUDE.md).
export const testSentences = ['Grandpa forgets every password twice', 'A polite yak sells tiny opinions', 'Nobody invited the grumpy lizard', 'Aunt Olga argues with a pigeon'] as const;

export const testBatch = (strokeId: string, points: number[] = [10, 10, 20, 20]): StrokeBatch => ({ strokeId, color: 0, size: 1, eraser: false, points });

interface TestTimer {
  at: number;
  run: () => void;
}

// A hand-cranked clock: `advance` moves time on and runs whatever came due, in order.
export class TestClock {
  now = 0;
  #timers = new Set<TestTimer>();

  readonly schedule: Schedule = (run, delayMs) => {
    const timer = { at: this.now + delayMs, run };

    this.#timers.add(timer);

    return (): void => {
      this.#timers.delete(timer);
    };
  };

  get pending(): number {
    return this.#timers.size;
  }

  advance(ms: number): void {
    const until = this.now + ms;
    let next = this.#nextDue(until);

    while (next) {
      this.#timers.delete(next);
      this.now = next.at;
      next.run();
      next = this.#nextDue(until);
    }

    this.now = until;
  }

  #nextDue(until: number): TestTimer | undefined {
    return [...this.#timers].filter((timer) => timer.at <= until).sort((a, b) => a.at - b.at)[0];
  }
}

export interface TestGame {
  game: TableRoomGame;
  members: TableRoomMembers;
  feed: TableRoomFeed;
  clock: TestClock;
  // Pages in the order the reveal turned them.
  turned: PageSnapshot[];
  // How often the game changed on its own (a timer).
  changes: () => number;
  // How often round 1 started.
  starts: () => number;
}

// A game with `people` at the table (ids p0, p1, …). Its `random` keeps the seats in join order, so
// in step 1 p1 holds p0's book, p2 holds p1's, and so on.
export const createTestGame = (people = 3): TestGame => {
  const clock = new TestClock();
  const members = new TableRoomMembers(() => 0);
  const feed = new TableRoomFeed({ now: () => clock.now, createId: () => `line-${++id}`, maxItems: 200 });
  const turned: PageSnapshot[] = [];
  let changes = 0;
  let starts = 0;
  let id = 0;

  const game = new TableRoomGame({
    members,
    feed,
    schedule: clock.schedule,
    now: () => clock.now,
    random: () => 0.999,
    createId: () => `id${++id}`,
    started: () => starts++,
    turned: (page) => turned.push(page),
    changed: () => changes++,
  });

  Array.from({ length: people }, (_, index) => members.join(`p${index}`, `Player ${index}`));

  return { game, members, feed, clock, turned, changes: () => changes, starts: () => starts };
};

// Everyone working writes or draws something, then presses Done.
export const finishStep = ({ game }: TestGame): void => {
  const round = game.round;

  if (!round) return;

  round.working.forEach((memberId, index) => {
    if (round.kind === 'write') game.pages.write(memberId, testSentences[index % testSentences.length] ?? '');
    else game.pages.stroke(memberId, testBatch(`${memberId}-${round.step}`));
  });

  round.working.forEach((memberId) => game.done(memberId));
};
