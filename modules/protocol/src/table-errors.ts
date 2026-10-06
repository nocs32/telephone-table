import type { TableIntentType } from './table-messages.js';

// Error codes of the live table. A refused join arrives as the join error's message; a refused
// intent arrives as an `error` event ({ code, type }) and the sender stays at the table.
export const tableErrorCodes = [
  // The web app and the server speak different protocol versions: reload.
  'PROTOCOL_MISMATCH',
  'INVALID_JOIN',
  'INVALID_MESSAGE',
  'RATE_LIMITED',
  'NOT_A_MEMBER',
  'ALREADY_A_MEMBER',
  'ROOM_CLOSED',
  // A rename that's empty once cleaned up.
  'EMPTY_NAME',
  // The game isn't in the phase this needs (settings outside the lobby, a page outside a step…).
  'WRONG_PHASE',
  'NOT_ENOUGH_PLAYERS',
  // Working on a page without a seat this round, or a drawing in a write step.
  'NOT_YOUR_PAGE',
  // Changing a page after pressing Done.
  'ALREADY_DONE',
  // Turning someone else's pages before the takeover (spec D6).
  'NOT_BOOK_OWNER',
  'NO_SUCH_PAGE',
  // Liking your own page, or picking your own page as the favourite.
  'OWN_PAGE',
  // The page hit its size cap.
  'PAGE_FULL',
  // A stroke or fill id someone else's action already has.
  'TAKEN_ID',
  'NOTHING_TO_UNDO',
] as const;

export type TableErrorCode = (typeof tableErrorCodes)[number];

export const isTableErrorCode = (value: unknown): value is TableErrorCode =>
  typeof value === 'string' && (tableErrorCodes as readonly string[]).includes(value);

// A refused intent, and which one it was.
export interface TableErrorEvent {
  code: TableErrorCode;
  type: TableIntentType;
}
