// Public API of the game engine: pure logic, no DOM, no Node.
export { bookHeldBy, bookPageCount, holderOf, promptPage, stepKindAt } from './books.js';
export { decodeDrawing, encodeDrawing } from './drawing-bytes.js';
export { floodFill, type Rgba } from './flood-fill.js';
export { pickAwards, rankByScore, tallyPoints, type Likes, type Placed, type ScoredPage } from './points.js';
export { createRandom, randomBetween, shuffle } from './random.js';
export { applySettings, changedSettings } from './settings.js';
export { makeSquiggle } from './squiggle.js';
export { timelapseFrame, timelapseMs } from './timelapse.js';
export { typedText, typingMs } from './typing.js';
