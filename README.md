# Telephone Table

A telephone drawing game you play with friends in the browser.

- **Write, draw, pass it on:** everyone writes a silly sentence on page one of their book. The books move one seat along, and each person draws the sentence they get. They move on again, and the next person describes the drawing without seeing the sentence. Writing and drawing alternate until every book has been through everyone's hands.
- **The reveal:** one book at a time, its owner turns the pages for the whole table. Drawings replay stroke by stroke, sentences type themselves out, and everyone sees how the sentence drifted.
- **Stickers:** while a book is open, slap stickers from the sticker sheet onto its pages. They stay on the book, and in the saved picture too.
- **Points, just for fun:** ❤️ the pages you love, each owner picks a favourite page in their book, and the podium crowns the best drawing and the best line.
- **Save a book:** download any book as one tall picture, ready for the group chat.
- **No accounts, no leftovers:** share the table link to play, in English or Ukrainian. A table disappears about 10 minutes after the last person leaves.

It's a sibling of [Scribble Table](https://github.com/nocs32/scribble-table), the drawing-and-guessing game, and [Felt Table](https://github.com/nocs32/felt-table-jigsaw), the multiplayer jigsaw, and shares their stack, rules and look.

> **Status:** the game plays on live tables run by the server. `pnpm demo` keeps a **demo table** in the browser, with sample players, for working on the UI. CI and hosting come next.

## Stack

| Part | Tech |
|---|---|
| Web (`modules/web`) | React 19, TypeScript, Vite, Panda CSS, MobX, Ark UI, i18next |
| API (`modules/core-api`) | Node.js, Express 5 and Colyseus 0.18 (run with `tsx`) |
| Shared | `modules/protocol` (the contract between the two) and `modules/engine` (pure game logic) |
| Tooling | pnpm workspaces, ESLint 10 + typescript-eslint, TypeScript 6.0 |

The server runs the game. It keeps the books, the seats and the clock, and it sends each person only the page they're responding to, so nobody can peek at a book before the reveal. Your page is saved as you go, so a reload puts you back where you were, draft and all. Tables live in the server's memory only, so there is no database.

## Getting started

**Requirements:** Node.js 24 (see `.nvmrc`) and pnpm 11+.

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts both apps:

| App | URL |
|---|---|
| Web | http://localhost:5175 |
| API | http://localhost:2569 — the web dev server forwards `/api/*`, and `/live` for tables, to it |

Open the web URL to get a table, then share its link: everyone who opens it sits down at the same table. To try a game alone, open the link in three or four browser tabs.

`pnpm demo` runs the web app alone against a demo table in the browser, with no API: three sample players sit down with you and a fourth joins a little later. The **Demo** buttons in the top bar skip ahead and add or remove a sample player.

Saving a file in `modules/core-api` restarts the API, which clears every table: open a new one afterwards.

The ports sit one above Scribble Table's (5174 and 2568) and two above Felt Table's (5173 and 2567), so all three games can run at the same time.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Runs the web app and the API with hot reload |
| `pnpm demo` | Runs the web app alone against the demo table (sample players, no server), for working on the UI |
| `pnpm lint` | Lints every module; `pnpm lint --fix` fixes spacing automatically |
| `pnpm typecheck` | Type-checks every module |
| `pnpm test` | Runs the engine and core-api tests; one module: `pnpm --filter @telephone-table/core-api test` |
| `pnpm build` | Builds the web app for production |

## Project layout

```
modules/
├─ web/          React frontend
├─ core-api/     Express + Colyseus backend
├─ protocol/     shared contract: messages, events, error codes
└─ engine/       pure game logic, shared by both apps
eslint.config.mjs   house lint rules
eslint-rules/       custom lint rules used by the config
```

## Conventions

**Code style** (enforced by `pnpm lint`):
- **Size:** at most 40 lines per function (components included) and 300 lines per file.
- **Nested functions:** inside a function, only arrow functions.
- **Names:** camelCase. PascalCase only for React components and for types and classes.
- **Return types:** every function that returns a value declares its return type.
- **Blank lines:** one before and after every code block.

**Web**
- **Component names follow their parent:** `Room` → `RoomBook` → `RoomBookPage`.
- **One component per `.tsx` file.** Components only render.
  - Logic lives in custom hooks and small MobX stores, which are modelled as state machines.
  - Styles live in `styled-components.ts` files written with Panda CSS.
- **All UI text is translated** into English and Ukrainian. What players write is shown as typed, in whatever language they wrote it.

**API**
- **Thin handlers:** they validate, call one service, and respond.
- **Logic** lives in small state-machine classes.
- **The server decides:** browsers send intents (a stroke batch, Done, a like) and never results.

**Starter sentences** for the 🎲 button (`modules/web/src/content/starters/`) stay clear of the words in Scribble Table's lists, so playing one game never spoils the other.

**Sounds** are CC0 recordings from [Freesound](https://freesound.org), credited in `modules/web/src/assets/sounds/credits.md`.

**TypeScript** stays on **6.0** until typescript-eslint supports TypeScript 7.

## Environment variables

| Variable | Used by | Default |
|---|---|---|
| `CORE_API_PORT` | core-api | `2569` |
