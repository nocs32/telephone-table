import { Server } from '@colyseus/core';
import type { Room as SdkRoom } from '@colyseus/sdk';
import { ColyseusTestServer } from '@colyseus/testing';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { decodeDrawing } from '@telephone-table/engine';
import { tableProtocolVersion, tableRoomName, type TableEvents, type TableJoinOptions } from '@telephone-table/protocol';
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest';
import { TableRoom } from './index.js';
import { testBatch, testSentences } from './test-table.js';

// Away from the dev servers' ports (2567–2569), so tests run while the games do. `boot` would
// always use 2568 for a Server instance, so the server is started here.
const port = 2591;

let colyseus: ColyseusTestServer;

beforeAll(async () => {
  const server = new Server({ transport: new WebSocketTransport(), greet: false });

  server.define(tableRoomName, TableRoom);
  await server.listen(port);
  colyseus = new ColyseusTestServer(server);
});

afterEach(async () => {
  await colyseus.cleanup();
});

afterAll(async () => {
  await colyseus.shutdown();
});

interface Logged {
  type: string;
  payload: unknown;
}

// One browser at the table, recording every message it gets.
interface Seat {
  room: SdkRoom;
  log: Logged[];
}

const joinOptions = (name: string): TableJoinOptions => ({ protocolVersion: tableProtocolVersion, name });

const listen = (room: SdkRoom): Seat => {
  const seat: Seat = { room, log: [] };

  room.onMessage('*', (type, payload) => seat.log.push({ type: String(type), payload }));
  room.send('sync', {});

  return seat;
};

const all = <K extends keyof TableEvents>(seat: Seat, type: K): Array<TableEvents[K]> =>
  seat.log.filter((logged) => logged.type === type).map((logged) => logged.payload as TableEvents[K]);

const latest = <K extends keyof TableEvents>(seat: Seat, type: K): TableEvents[K] | undefined => all(seat, type).at(-1);

const until = async (check: () => boolean, timeoutMs = 3000): Promise<void> => {
  const started = Date.now();

  while (!check()) {
    if (Date.now() - started > timeoutMs) throw new Error('Timed out waiting for the room');

    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

const sitDown = async (count: number): Promise<Seat[]> => {
  const first = listen(await colyseus.sdk.create(tableRoomName, joinOptions('Player 0')));
  const joining = Array.from({ length: count - 1 }, async (_, index) => listen(await colyseus.sdk.joinById(first.room.roomId, joinOptions(`Player ${index + 1}`))));
  const seats = [first, ...(await Promise.all(joining))];

  await until(() => seats.every((seat) => latest(seat, 'view')?.members.length === count));

  return seats;
};

const stepOf = (seat: Seat): number | undefined => latest(seat, 'view')?.game.step?.index;

const taskOf = (seat: Seat): NonNullable<TableEvents['task']['task']> | null => latest(seat, 'task')?.task ?? null;

// Everyone writes (or draws) and presses Done; returns once the next step or the reveal is on.
const playStep = async (seats: Seat[], write: (index: number) => string): Promise<void> => {
  const step = stepOf(seats[0] as Seat) ?? 0;

  seats.forEach((seat, index) => {
    if (taskOf(seat)?.kind === 'write') seat.room.send('draft', { text: write(index) });
    else seat.room.send('stroke', testBatch(`stroke-${index}-${step}`));

    seat.room.send('done', {});
  });

  await until(() => seats.every((seat) => stepOf(seat) !== step));
};

test('a web app on another protocol version is turned away', async () => {
  await expect(colyseus.sdk.create(tableRoomName, { protocolVersion: 0, name: null })).rejects.toThrow('PROTOCOL_MISMATCH');
});

test('lobby doodles reach everyone else at once, and round 1 wipes the board', async () => {
  const [ana, bo, cy] = (await sitDown(3)) as [Seat, Seat, Seat];

  ana.room.send('doodleStroke', testBatch('doodle-1'));
  await until(() => all(bo, 'doodle').length === 1 && all(cy, 'doodle').length === 1);
  expect(all(ana, 'doodle')).toEqual([]);

  bo.room.send('start', {});
  await until(() => [ana, bo, cy].every((seat) => all(seat, 'doodleDrawing').length === 2));
  expect(decodeDrawing(new Uint8Array(latest(cy, 'doodleDrawing')?.bytes ?? []))).toEqual([]);
});

test('everyone gets their task at once, and a reload mid-step keeps the task and the draft', async () => {
  const seats = await sitDown(3);
  const [ana, bo] = seats as [Seat, Seat];

  ana.room.send('start', {});
  await until(() => seats.every((seat) => taskOf(seat)?.first === true));
  bo.room.send('draft', { text: testSentences[1] });
  await new Promise((resolve) => setTimeout(resolve, 50));

  const token = bo.room.reconnectionToken;
  const taskId = taskOf(bo)?.id;

  await bo.room.leave(false);
  await until(() => latest(ana, 'view')?.members.some((member) => !member.connected) === true);

  const back = listen(await colyseus.sdk.reconnect(token));

  await until(() => taskOf(back) !== null);
  expect(taskOf(back)).toMatchObject({ id: taskId, kind: 'write', draft: { text: testSentences[1] } });
  await until(() => latest(ana, 'view')?.members.every((member) => member.connected) === true);
});

const isRevealView = (logged: Logged): boolean => logged.type === 'view' && (logged.payload as TableEvents['view']).game.phase === 'reveal';

// Everything a browser got before the reveal began (its first page comes just before its view).
const beforeReveal = (seat: Seat): Seat => {
  const end = seat.log.findIndex((logged) => logged.type === 'pages' || isRevealView(logged));

  return { ...seat, log: seat.log.slice(0, end < 0 ? undefined : end) };
};

// Before the reveal, a person sees one sentence that isn't theirs (the one they draw) and one
// drawing (the one they describe), only in their tasks, and no pages at all (spec D10).
const expectNoPeeking = (seat: Seat, index: number): void => {
  const early = beforeReveal(seat);
  const others = testSentences.filter((_, at) => at !== index && at < 3);
  const outside = JSON.stringify(early.log.filter((logged) => logged.type !== 'task'));
  const prompts = all(early, 'task').flatMap((event) => (event.task?.prompt ? [event.task.prompt] : []));

  expect(seat.log.length).toBeGreaterThan(early.log.length);
  expect(all(early, 'pages')).toEqual([]);
  expect(others.filter((sentence) => outside.includes(sentence))).toEqual([]);
  expect(prompts.map((prompt) => prompt.kind)).toEqual(['sentence', 'drawing']);
  expect(others).toContain(prompts[0]?.text);
};

test('no peeking: pages stay private until the reveal turns them, one at a time', async () => {
  const seats = await sitDown(3);
  const [ana] = seats as [Seat];

  ana.room.send('updateSettings', { rounds: 1 });
  ana.room.send('start', {});
  await until(() => seats.every((seat) => taskOf(seat)?.first === true));
  await playStep(seats, (index) => testSentences[index] ?? '');
  await playStep(seats, () => '');
  await playStep(seats, () => testSentences[3]);
  await until(() => seats.every((seat) => latest(seat, 'view')?.game.phase === 'reveal'));

  seats.forEach((seat, index) => expectNoPeeking(seat, index));
  await expectPagesOneByOne(seats);
});

// The open book's first page went out as it opened; someone else can't turn it; the owner can.
const expectPagesOneByOne = async (seats: Seat[]): Promise<void> => {
  const view = latest(seats[0] as Seat, 'view');
  const ownerId = view?.game.books.find((book) => book.id === view.game.reveal?.bookId)?.owner.id;
  const owner = seats.find((seat) => seat.room.sessionId === ownerId) as Seat;
  const other = seats.find((seat) => seat !== owner) as Seat;
  const pagesOf = (seat: Seat): string[] => all(seat, 'pages').flatMap((event) => event.pages.map((page) => page.id));

  await until(() => seats.every((seat) => pagesOf(seat).length === 1));
  other.room.send('turnPage', {});
  await until(() => latest(other, 'error')?.code === 'NOT_BOOK_OWNER');

  owner.room.send('turnPage', {});
  await until(() => seats.every((seat) => pagesOf(seat).length === 2));
  expect(all(other, 'pages').at(-1)?.pages[0]).toMatchObject({ index: 1, kind: 'drawing' });
};
