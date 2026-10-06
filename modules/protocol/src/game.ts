// The game's phases, settings and timings (spec §4–§5).

// lobby → (step → … → reveal → break) × rounds, the last reveal going to the podium (points on) or
// straight to the shelf (points off); Play again goes back to the lobby (spec §9.2).
export const gamePhases = ['lobby', 'step', 'reveal', 'break', 'podium', 'shelf'] as const;

export type GamePhase = (typeof gamePhases)[number];

// Steps alternate, starting and ending with writing (spec §4.4).
export type StepKind = 'write' | 'draw';

// `everyone`: one page per seated player (plus one when that's even); otherwise at most this many.
export const bookLengths = ['everyone', 3, 5, 7, 9, 11] as const;

export type BookLength = (typeof bookLengths)[number];

export interface GameSettings {
  rounds: number;
  writeSeconds: number;
  drawSeconds: number;
  bookLength: BookLength;
  // Likes, favourites and the podium, just for fun (spec D7).
  points: boolean;
}

export type GameSettingKey = keyof GameSettings;

export const gameLimits = {
  rounds: { min: 1, max: 5 },
  writeSeconds: { min: 15, max: 90, step: 5 },
  drawSeconds: { min: 30, max: 180, step: 10 },
  // Start needs this many people at the table, and so does the next round.
  minPlayers: 3,
  maxPlayers: 12,
  // A round with fewer people still working skips to its reveal (spec §4.6).
  minWorking: 2,
  breakSeconds: 15,
  // At the reveal, everyone may turn the pages after this long without a turn (spec D6).
  ownerIdleSeconds: 20,
  // When time runs out, stroke batches still on their way count for this long (spec §5.4).
  lastBatchMs: 1000,
  likePoints: 1,
  favouritePoints: 3,
} as const;

export const defaultGameSettings: GameSettings = {
  rounds: 3,
  writeSeconds: 40,
  drawSeconds: 80,
  bookLength: 'everyone',
  points: true,
};

// One line of writing (spec §5.2).
export const sentenceMaxLength = 100;
