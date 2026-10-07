import { gameLimits, pageMaxActions, type TableIntentType } from '@telephone-table/protocol';

export interface Rate {
  count: number;
  windowMs: number;
}

// Every rate limit, size cap and timeout of core-api, in one place (spec §9.5).
export const limits = {
  table: {
    // People at one table (spec D17). Seats held for reconnecting people count too.
    maxClients: gameLimits.maxPlayers,
    // An empty table is kept this long, then thrown away (spec D17).
    emptyGraceMs: 10 * 60 * 1000,
    // A dropped connection keeps its seat this long.
    reconnectSeconds: 20,
    // A dropped connection stops holding a step up after this long (spec §5.4): a reload is
    // back sooner.
    dropGraceMs: 5000,
    // Hard cap on messages from one connection; Colyseus disconnects anyone above it. The doodle
    // board sends a stroke batch every 50 ms.
    maxMessagesPerSecond: 100,
    // One page's drawing, and the doodle board: actions (strokes and fills) and points in all
    // strokes together.
    drawing: { maxActions: pageMaxActions, maxPoints: 100_000 },
    // Per person and intent: at most `count` in any `windowMs`. Extra messages are refused.
    rates: {
      sync: { count: 5, windowMs: 10_000 },
      start: { count: 5, windowMs: 5000 },
      updateSettings: { count: 20, windowMs: 5000 },
      // Looser than the browser's pace (protocol `chatPace`, 5 in 3 s), so jitter never trips it.
      chat: { count: 8, windowMs: 3000 },
      react: { count: 8, windowMs: 1000 },
      rename: { count: 10, windowMs: 10_000 },
      // The doodle board goes out live, a batch every 50 ms while someone draws.
      doodleStroke: { count: 30, windowMs: 1000 },
      doodleFill: { count: 10, windowMs: 1000 },
      doodleUndo: { count: 30, windowMs: 1000 },
      doodleSquiggle: { count: 5, windowMs: 5000 },
      // A sentence draft goes out a second after typing stops, and once more at Done.
      draft: { count: 2, windowMs: 1000 },
      // A page's strokes go out every 250 ms; quick dots each end their own batch, so there's room.
      stroke: { count: 20, windowMs: 1000 },
      fill: { count: 10, windowMs: 1000 },
      // Generous: undo happens in the browser at once, so a refused one would leave the saved
      // page behind what the drawer sees.
      undo: { count: 30, windowMs: 1000 },
      clear: { count: 10, windowMs: 5000 },
      done: { count: 10, windowMs: 5000 },
      undone: { count: 10, windowMs: 5000 },
      turnPage: { count: 10, windowMs: 5000 },
      skipReplay: { count: 10, windowMs: 5000 },
      favourite: { count: 10, windowMs: 5000 },
      nextBook: { count: 10, windowMs: 5000 },
      like: { count: 20, windowMs: 5000 },
      stick: { count: 10, windowMs: 5000 },
      peel: { count: 10, windowMs: 5000 },
      startNow: { count: 5, windowMs: 5000 },
      playAgain: { count: 5, windowMs: 5000 },
    } satisfies Record<TableIntentType, Rate>,
  },
} as const;
