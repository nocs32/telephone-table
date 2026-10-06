import type { TableIntents, TableIntentType } from '@telephone-table/protocol';

export type { BoardAction, FillAction, PlayerColor, StrokeAction } from '@telephone-table/protocol';

// Asks the table for something (an intent); the answer comes back in the next snapshot.
export type TableSend = <T extends TableIntentType>(type: T, message: TableIntents[T]) => void;

// Reconnecting: the connection dropped and the table holds their seat for a while.
export type PresenceStatus = 'online' | 'reconnecting';
