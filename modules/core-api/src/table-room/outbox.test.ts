import type { TableEvents } from '@telephone-table/protocol';
import { expect, test } from 'vitest';
import { TableRoomFeed } from './feed.js';
import { TableRoomOutbox } from './outbox.js';
import type { TableRoomView } from './view.js';

interface Sent {
  to: string;
  type: keyof TableEvents;
}

interface Harness {
  outbox: TableRoomOutbox;
  feed: TableRoomFeed;
  sent: Sent[];
  state: { phase: 'lobby' | 'step'; taskId: string | null; tasksBuilt: number };
}

const ana = { id: 'a', name: 'Ana', color: 'sky' } as const;

const createOutbox = (): Harness => {
  const sent: Sent[] = [];
  const state: Harness['state'] = { phase: 'lobby', taskId: null, tasksBuilt: 0 };
  let lines = 0;
  const feed = new TableRoomFeed({ now: () => 0, createId: () => `line-${++lines}`, maxItems: 50 });

  const outbox = new TableRoomOutbox({
    feed,
    view: () => ({ members: [], game: { phase: state.phase } }) as unknown as TableRoomView,
    taskIdFor: () => state.taskId,
    taskFor: () => {
      state.tasksBuilt += 1;

      return null;
    },
    pages: () => [],
    doodle: () => new Uint8Array(),
    now: () => 0,
    send: (to, type) => sent.push({ to, type }),
    broadcast: (type) => sent.push({ to: '*', type }),
  });

  return { outbox, feed, sent, state };
};

test('sync sends one browser everything it may see', () => {
  const { outbox, sent } = createOutbox();

  outbox.sync('a');

  expect(sent).toEqual([
    { to: 'a', type: 'view' },
    { to: 'a', type: 'feed' },
    { to: 'a', type: 'task' },
    { to: 'a', type: 'doodleDrawing' },
  ]);
});

test('flush sends the view only when it changed, and new feed lines only to synced browsers', () => {
  const { outbox, feed, sent, state } = createOutbox();

  outbox.flush();
  outbox.flush();
  expect(sent).toEqual([{ to: '*', type: 'view' }]);

  outbox.sync('a');
  sent.length = 0;
  feed.message(ana, 'hello');
  state.phase = 'step';
  outbox.flush();

  expect(sent).toEqual([
    { to: '*', type: 'view' },
    { to: 'a', type: 'feed' },
  ]);
});

test('a task goes out only when a new one starts, and nothing personal after forget', () => {
  const { outbox, sent, state } = createOutbox();

  outbox.sync('a');
  outbox.flush();
  sent.length = 0;
  state.tasksBuilt = 0;

  state.taskId = 'step-1';
  outbox.flush();
  outbox.flush();
  expect(sent.filter((item) => item.type === 'task')).toHaveLength(1);
  expect(state.tasksBuilt).toBe(1);

  outbox.forget('a');
  state.taskId = 'step-2';
  outbox.flush();
  expect(sent.filter((item) => item.type === 'task')).toHaveLength(1);
});
