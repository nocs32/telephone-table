import * as v from 'valibot';
import { boardHeight, boardWidth, brushSizes, inkColors, strokeBatchMaxPoints } from './drawing.js';
import { bookLengths, sentenceMaxLength } from './game.js';
import { personNameMaxLength } from './players.js';
import { stickers } from './stickers.js';

// Bumped whenever an intent or an event changes shape. A web app on another version is turned
// away with PROTOCOL_MISMATCH and asked to reload.
export const tableProtocolVersion = 1;

// The Colyseus room type the web app creates and joins.
export const tableRoomName = 'table';

export const chatMaxLength = 200;

// How fast one person may chat: the browser keeps to this pace and holds a line back when it's
// faster (spec §9.5). The server's own cap is a little looser, so network jitter never trips it.
export const chatPace = { count: 5, windowMs: 3000 } as const;

export const emojiMaxLength = 32;

// Emoji plus their components (joiners, variation selectors, keycaps, skin tones), with at
// least one non-ASCII character so plain digits, # and * don't count.
const emojiPattern = /^[\p{Emoji}\p{Emoji_Component}]+$/u;
const asciiPattern = /^[\x20-\x7e]*$/u;

const isEmoji = (text: string): boolean => emojiPattern.test(text) && !asciiPattern.test(text);

// Strokes, fills and pages are named with letters, digits, _ and -.
const id = v.pipe(v.string(), v.regex(/^[\w-]{1,64}$/u));

const integer = (low: number, high: number): v.GenericSchema<number> => v.pipe(v.number(), v.integer(), v.minValue(low), v.maxValue(high));

const inkIndex = integer(0, inkColors.length - 1);

// x, y pairs, each on the board.
const isBoardPath = (points: number[]): boolean =>
  points.length % 2 === 0 && points.every((value, index) => value <= (index % 2 === 0 ? boardWidth : boardHeight));

const boardPoints = v.pipe(
  v.array(v.pipe(v.number(), v.finite(), v.minValue(0))),
  v.minLength(2),
  v.maxLength(strokeBatchMaxPoints * 2),
  v.check(isBoardPath),
);

const strokeBatch = v.strictObject({ strokeId: id, color: inkIndex, size: integer(0, brushSizes.length - 1), eraser: v.boolean(), points: boardPoints });

// From 0 to 1 across a page (a sticker's place).
const unit = v.pipe(v.number(), v.finite(), v.minValue(0), v.maxValue(1));

const boardFill = v.strictObject({
  id,
  x: v.pipe(v.number(), v.finite(), v.minValue(0), v.maxValue(boardWidth)),
  y: v.pipe(v.number(), v.finite(), v.minValue(0), v.maxValue(boardHeight)),
  color: inkIndex,
});

// Settings are clamped on the server, so these bounds only keep junk out.
const settingsPatch = v.partial(
  v.strictObject({
    rounds: integer(0, 100),
    writeSeconds: integer(0, 1000),
    drawSeconds: integer(0, 1000),
    bookLength: v.picklist(bookLengths),
    points: v.boolean(),
  }),
);

const empty = v.strictObject({});

// Sent with create and join. `name` is the name this browser picked before (null: the table makes one up).
export const tableJoinOptionsSchema = v.strictObject({
  protocolVersion: v.pipe(v.number(), v.integer()),
  name: v.nullable(v.pipe(v.string(), v.maxLength(personNameMaxLength * 2))),
});

export type TableJoinOptions = v.InferOutput<typeof tableJoinOptionsSchema>;

// Client → server: intents only; the server works out every result. Every message is checked
// against its schema, and unknown fields are rejected.
export const tableIntentSchemas = {
  // "Send me everything": after joining or reconnecting, once the browser listens.
  sync: empty,
  start: empty,
  updateSettings: settingsPatch,
  chat: v.strictObject({ text: v.pipe(v.string(), v.maxLength(chatMaxLength)) }),
  react: v.strictObject({ emoji: v.pipe(v.string(), v.maxLength(emojiMaxLength), v.check(isEmoji)) }),
  rename: v.strictObject({ name: v.pipe(v.string(), v.maxLength(personNameMaxLength * 2)) }),
  // The lobby's doodle board (spec D22): drawn live, for everyone. `doodleSquiggle` rolls a new
  // squiggle on a clean board.
  doodleStroke: strokeBatch,
  doodleFill: boardFill,
  doodleUndo: empty,
  doodleSquiggle: empty,
  // Your page in this step, saved as you go and passed on to nobody (spec D11).
  draft: v.strictObject({ text: v.pipe(v.string(), v.maxLength(sentenceMaxLength)) }),
  stroke: strokeBatch,
  fill: boardFill,
  undo: empty,
  clear: empty,
  done: empty,
  undone: empty,
  // The reveal (spec §4.5).
  turnPage: empty,
  skipReplay: empty,
  favourite: v.strictObject({ pageId: id }),
  nextBook: empty,
  like: v.strictObject({ pageId: id, liked: v.boolean() }),
  // Stickers on the open book's turned pages (spec D25); you peel off only your own.
  stick: v.strictObject({ pageId: id, sticker: v.picklist(stickers), x: unit, y: unit }),
  peel: v.strictObject({ stickerId: id }),
  // Between rounds, and after the game.
  startNow: empty,
  playAgain: empty,
};

export type TableIntentType = keyof typeof tableIntentSchemas;

export type TableIntents = { [K in TableIntentType]: v.InferOutput<(typeof tableIntentSchemas)[K]> };
