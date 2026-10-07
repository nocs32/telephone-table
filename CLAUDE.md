# Telephone Table

A multiplayer telephone drawing game:
- share a table by URL; everyone writes a sentence, the books are passed along, and each person draws the sentence they get or describes the drawing they get;
- at the end of a round every book is revealed page by page, and the table is thrown away about 10 minutes after everyone leaves.

It's the sibling of Scribble Table (`../drawing-game`) and Felt Table (`../felt-table-jigsaw`): same stack, same house rules, same design system. It's its own project, copied from Scribble Table: fixes to shared parts get copied between the projects by hand (spec D3). The full spec is in `.scratch/SPEC.md`. Read §0 "Decisions so far" before planning any feature: every decision there is settled.

## How we work
Setup commit first (M0), then each phase gets its own branch and PR, as in the siblings (spec D18, §12):
1. **Web UI** (`feat/web-ui`), on local MobX stores against the demo table. We review it together, then PR and merge.
2. **Backend, and connecting the UI to it** (`feat/live-tables`). We review and check it together, then PR and merge.
3. **CI** (`feat/ci`). PR and merge.
4. **Hosting** (`feat/hosting`): `pnpm play` and the `telephone-table` Cloudflare Tunnel on telephone.timnox.dev.

**Every feature explains itself on screen** (spec D23): anything people wouldn't guess (likes, the favourite pick, stickers, Start now, the doodle board, the 🎲) gets a short line of text or a hint right where it's used. Check it in every UI review.

## Scribble Table's word lists stay secret
The user plays Scribble Table, so knowing its words would spoil it. Nothing in this game is secret from the user (spec D1), but these rules guard the sibling's lists:
- **Never show a word from Scribble Table's lists:** not in chat, commit messages, PR descriptions, docs, code comments or test names. Never open, decode or print them in the main session (they're `../drawing-game/modules/core-api/src/words/word-list.b64`). Talk about them only in aggregate.
- **Starter sentences avoid them** (spec D20, §10): `modules/web/src/content/starters/`. So do the demo table's sample sentences (`modules/web/src/services/demo-table/samples.ts`) and the test sentences. A subagent compares new or changed sentences with the lists, rewrites clashes, and reports only how many it found and rewrote, never the words. Don't paste a before/after of those files either: what changed hints at the words.
- The starter sentences themselves aren't secret: the user can read and edit them.

## Layout
- `modules/web`: frontend. Vite + React 19 + TypeScript, Panda CSS, MobX, Ark UI, i18next (English and Ukrainian).
- `modules/core-api`: backend. Node + Express 5 + Colyseus 0.18 (live tables), one process on :2569.
- `modules/protocol`: the shared contract. Intent schemas, server events, error codes.
- `modules/engine`: pure game logic (the rotation and book length, the leaver rule, points, squiggles, drawing bytes), shared by both apps.
- `eslint.config.mjs` + `eslint-rules/`: the house lint rules for every module.
- `.scratch/`: spec and notes, ignored by git.

## Rules: read them before writing code
- **Before** creating or editing anything in `modules/web/**`, read `.claude/rules/web.md` and follow it.
- **Before** creating or editing anything in `modules/core-api/**`, read `.claude/rules/core-api.md` and follow it.
- These rules load automatically only once a matching file is opened. Read them first anyway, especially when creating new files.
- **Before calling a change done,** run `pnpm lint` and `pnpm typecheck` and fix what they report. Don't disable rules or add `eslint-disable` comments without asking.

**House lint rules** (enforced everywhere):
- **Size:** at most 40 lines per function (components included) and 300 lines per file. Blank lines and comments don't count.
- **Nested functions:** inside a function, only arrow functions. No nested `function` declarations or expressions, and no object or class methods.
- **Names:** camelCase for everything. PascalCase only for React components (which must render JSX) and for types and classes.
- **Return types:** required on every function that returns a value. Lambdas passed as arguments or JSX props are exempt.
- **Blank lines:** exactly one before and after every code block (functions, if, loops, switch, try, multi-line statements). `pnpm lint --fix` adds them.

## Commands
```bash
pnpm install
pnpm dev           # web on http://localhost:5175 + core-api on :2569 (Vite forwards /api, and /live for tables)
pnpm lint          # add --fix to auto-fix spacing
pnpm typecheck
pnpm test          # engine + core-api; one module: pnpm --filter @telephone-table/core-api test
pnpm demo          # web only, against the demo table (no server): for UI work
pnpm build         # production web build (CI runs lint, typecheck, test, build on every PR and push to main)
pnpm play          # build + serve at https://telephone.timnox.dev from this PC through a Cloudflare Tunnel
```

## Gotchas
- **Ports are 5175, 2569 and 4175** (web, core-api, preview), one above Scribble Table's (5174, 2568, 4174) and two above Felt Table's (5173, 2567, 4173), so all three games can run at once. All are `strictPort`: a taken port fails loudly instead of moving.
- **TypeScript is pinned to 6.0.** typescript-eslint doesn't support TypeScript 7 yet. Don't upgrade it.
- **pnpm workspaces:** the packages are listed in `pnpm-workspace.yaml`. Add a dependency with `pnpm --filter @telephone-table/<module> add <pkg>`.
- **pnpm's release-age guard:** pnpm refuses versions published in the last day. Pick the previous version instead of adding exceptions.
- **No shared Colyseus state, and no peeking** (spec D10, §9.3): the server sends each person only the page they're responding to, and a page goes to everyone only when it's turned at the reveal. Drawings are saved to the server as you go, never streamed to others (D11). After joining or reconnecting, the browser asks for its task and draft with `sync`.
- **Hosting is `pnpm play`, not a cloud host** (free, no payment card), as in the siblings. It runs `vite preview` on `127.0.0.1:4175`, which reuses the dev `/api` + `/live` proxy and only accepts the telephone.timnox.dev host, plus core-api and the `telephone-table` Cloudflare Tunnel (credentials in `~/.cloudflared/`). Stop `pnpm dev` first, since both need port 2569. The user starts `pnpm play` themselves: don't start it for them, give them the command.
- **The demo table** (spec D19): `services/demo-table` plays the server's part in the browser, with sample players who write, draw ready-made sketches, like pages, stick stickers on them and turn their own books' pages. `pnpm dev` plays at live tables on core-api (`services/live-table`, behind the same `TableClientService`); `pnpm demo` plays at the demo table. The top bar's **Demo** buttons skip ahead (start, end a step, turn a page, start the next round) and add or remove a sample player (removing one mid-round shows the leaver rule).
- **Live tables live in core-api's memory:** `tsx watch` restarts core-api when you save a file there, and every table is gone. Open a new one. To play a live table alone, open its link in three or four tabs: each tab is its own person (its seat is kept in sessionStorage, so a reload gets it back).
- **A dropped connection** keeps its seat for 20 seconds, and stops holding a step up after 5 (`limits.ts`), so a reload never costs the last person their step.
- **Sounds** are CC0 recordings from Freesound, credited in `modules/web/src/assets/sounds/credits.md`. Generated sounds didn't sound good enough, so new ones come from there too.
- **Dev handle:** in development the root store is `window.telephoneTable`, for checking state from the console or a test script, e.g. `telephoneTable.room.game.state`, `telephoneTable.room.reveal.status`, or at the demo table `telephoneTable.room.demo.skip()`.
