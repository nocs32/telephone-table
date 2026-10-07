---
paths:
  - "modules/core-api/**"
---

# Core API rules (`modules/core-api`)

Node + Express 5 for HTTP, and Colyseus 0.18 for the live multiplayer rooms. These rules come on top of the lint rules in `eslint.config.mjs` and follow the same ideas as the web rules: thin edges, small named units, and logic in small state machines.

**Colyseus specifics:**
- One process serves both: `new Server({ transport: new WebSocketTransport(), express: (app) => … })` in `src/index.ts`. Colyseus answers `/matchmake/*` and the WebSocket upgrades; everything else falls through to Express. No Redis (one process, spec §9.1).
- Room classes extend Colyseus `Room<{ client }>`. Class fields like `maxClients` and `autoDispose` are fine (Colyseus re-installs its accessors in `__init`).
- **No Schema state, and no peeking** (spec D10, §9.3). The room sends each person their own view as messages, through `TableRoomOutbox` (the shapes are `TableEvents` in the protocol): `view` (shared, sent when it changed), `task` (per person: the page they respond to, sent when a step starts and again with their draft after `sync`), `pages` (to everyone, only as the reveal turns them; every turned page after `sync`), `feed`, plus `doodle` and `doodleDrawing` (the lobby board, D22), `reaction` and `error` events. Drawings travel as bytes (engine `encodeDrawing`). Messages arrive in order, which state patches don't promise. A browser gets nothing personal until it sends `sync`.
- **Nobody gets the books before the reveal,** not even in pieces: a writer gets one drawing, a drawer one sentence. Drawing batches are stored, never relayed (D11). The room test records every message one player gets and checks this.
- Message handlers follow rule 3 through the room's `#on(type, handle)`: valibot schema from the protocol, then the rate limit, then one call. Don't pass a schema to Colyseus's own `onMessage`/`validate`: a failed check there disconnects the sender. Refusals go back as an `error` event (`{ code }`).
- Join options are checked in `onJoin`; a refused join throws `ServerError` with the typed code as its message.
- Tests: unit tests per part (`*.test.ts` next to it) and a room test through a real server with `@colyseus/testing` (`table-room/index.test.ts`). Run `pnpm --filter @telephone-table/core-api test`.

## 1. Names follow the owner
A unit that belongs to another starts with its owner's name:
- `TableRoom` → `TableRoomGame` → `TableRoomGameClock`
- `TableRoom` → `TableRoomPages` → `TableRoomPagesLimits`

Shared building blocks are named for what they are: `logger`, `limits`.

## 2. One unit per file
- One class, one router or one handler group per file.
- Files and folders are kebab-case, named after what they hold: `table-room-books.ts` (`TableRoomBooks`), `health-router.ts` (`healthRouter`). The lint rule `local/kebab-case-filenames` enforces it.
- A unit with sub-units becomes a folder: `index.ts` holds the main unit, and each sub-unit gets a short-named file next to it (`table-room/index.ts`, `table-room/books.ts`).

## 3. Edges are thin
This is the backend version of "components only render". Express route handlers and live message handlers do exactly three things:
1. Validate the input with the shared schema.
2. Call **one** method on a service or room class.
3. Send the result, or a typed error.

No game rules, storage or calculations inside handlers.

## 4. Logic lives in small state-machine classes
- **Composed rooms.** A room is built from small classes, each owning one concern (spec §9.2): the game and its clock, the books and seats, the pages and drafts, the reveal, the points, feed/chat, lifecycle (the 10-minute empty timer), rate limits. `TableRoom` only wires them together.
- **Explicit states.** Each class has a fixed set of states:
  - room lifecycle: `'active' | 'emptyGrace' | 'closed'`;
  - the game: `'lobby' | 'step' | 'reveal' | 'break' | 'podium' | 'shelf'`.
- **Transitions** are methods named after events: `join`, `leave`, `start`, `done`, `undone`, `turnPage`, `like`, `expire`. An invalid transition is rejected with a typed error code.
- **Pure game logic** (the rotation and book length, the leaver rule, the points tally and awards, squiggles, drawing bytes) lives in the shared engine module and has no I/O.
- **Tests.** Each state-machine class has unit tests for its transitions, including the rejected ones. Test sentences are made up and avoid Scribble Table's word lists (see CLAUDE.md).

## 5. The server decides; clients only ask
- **Intents, not results.** Clients send intents such as `done` or `like`, and the server works out the result. Never accept a finished result from a client, like "my step is over" or "I scored 3".
- **Validate everything.** Check every message and request body against its schema:
  - reject unknown fields;
  - clamp numbers to sane ranges;
  - check the sender is allowed (only a page's author sends its strokes; only the book's owner turns its pages until the takeover).
- **Limits in one place.** Rate limits and size caps are constants in a single `limits.ts` (spec §9.5).

## 6. Every piece of memory has an owner
- **No database.** Tables, books and pages live in memory (spec D4).
- **Cleanup.** Every `Map`, timer and interval belongs to a class that clears it in `dispose()`.
- **No module-level mutable state**, except the composition root (`src/index.ts`), which creates the long-lived instances.

## 7. Config, errors and logs
- **Config:** environment variables are read and validated once in `src/config.ts`. Nothing else reads `process.env`.
- **Errors:** use typed error codes shared with the web app, like `'TABLE_NOT_FOUND'` or `'NOT_BOOK_OWNER'`. Never use raw strings.
- **Logs:** log through `src/logger.ts` with context such as `roomId` and `sessionId`. No `console.log` anywhere else. Never log a page's content.

## 8. One shared contract
- Intent schemas, server events, error codes and name rules live in `@telephone-table/protocol`. Both apps import them. Never redefine them in core-api.
- Changing an intent's or an event's shape bumps `tableProtocolVersion`.

## Folder example
```
src/
├─ index.ts                 composition root: config, logger, Express, Colyseus, listen
├─ config.ts
├─ logger.ts
├─ limits.ts
├─ errors/                  ApiErrorException, errorMiddleware, notFoundMiddleware
├─ health/index.ts          healthRouter (/api/health)
└─ table-room/
   ├─ index.ts              TableRoom: wires the parts to Colyseus
   ├─ members.ts            TableRoomMembers
   ├─ feed.ts               TableRoomFeed
   ├─ game.ts               TableRoomGame (lobby → steps → reveal → break | podium → shelf, the clock, settings)
   ├─ books.ts              TableRoomBooks (one round: seats, books, who holds which book, Done, leavers)
   ├─ pages.ts              TableRoomPages (this step's drafts and their limits)
   ├─ drawing.ts            TableRoomDrawing (one board's strokes and fills: a page, or the doodle board)
   ├─ reveal.ts             TableRoomReveal (the open book and page, the owner's control, the takeover)
   ├─ points.ts             TableRoomPoints (likes, the tally, awards)
   ├─ stickers.ts           TableRoomStickers (stickers on the open book's pages)
   ├─ away.ts               TableRoomAway (a dropped connection's grace before it stops holding a step up)
   ├─ doodle.ts             TableRoomDoodle (the lobby board: squiggle seed, live strokes)
   ├─ view.ts               what's sent: the shared view, a person's task, pages as bytes
   ├─ outbox.ts             TableRoomOutbox (what each person is sent, and when)
   ├─ rate-limits.ts        TableRoomRateLimits
   ├─ lifecycle.ts          TableRoomLifecycle
   └─ *.test.ts             (test-table.ts: made-up sentences and a hand-cranked clock)
```
