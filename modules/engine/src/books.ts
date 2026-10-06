// Who works on which book (spec §4.4) and what they respond to (spec §4.6). Seats are numbered in
// order around the table, and each book by its owner's seat.
import type { BookLength, PageKind, StepKind } from '@telephone-table/protocol';

// Pages in each book of a round: one per seated player, plus one when that's even, so every book
// ends on a sentence that its owner writes (spec D9). A shorter setting caps it; lengths are odd.
export const bookPageCount = (players: number, length: BookLength): number => {
  const full = players % 2 === 0 ? players + 1 : players;

  return length === 'everyone' ? full : Math.min(length, full);
};

// Step 0 is writing; then drawing and writing take turns.
export const stepKindAt = (step: number): StepKind => (step % 2 === 0 ? 'write' : 'draw');

// Every book moves one seat along each step: the seat that holds book `book` at step `step`.
export const holderOf = (book: number, step: number, seats: number): number => (book + step) % seats;

// The book that seat `seat` holds at step `step`.
export const bookHeldBy = (seat: number, step: number, seats: number): number => (((seat - step) % seats) + seats) % seats;

// What a holder responds to: the book's latest page of the other kind. A drawer gets the latest
// sentence, a writer the latest drawing, so a book keeps going when someone has left and their
// pages are missing. null when there's none: page one, or no drawing yet.
export const promptPage = <T extends { kind: PageKind }>(pages: readonly T[], step: StepKind): T | null =>
  pages.findLast((page) => page.kind === (step === 'draw' ? 'sentence' : 'drawing')) ?? null;
