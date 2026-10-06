// At the reveal a sentence types itself out, the way a drawing replays (spec §6): briefly, whatever
// its length, letter by letter. Letters are code points, so an emoji never splits in half.

const shortestMs = 500;
const longestMs = 2000;
const msPerLetter = 45;

const letters = (text: string): string[] => Array.from(text);

export const typingMs = (text: string): number => Math.min(longestMs, Math.max(shortestMs, letters(text).length * msPerLetter));

// The sentence as it stands `progress` (0–1) of the way through.
export const typedText = (text: string, progress: number): string => {
  const all = letters(text);

  return all.slice(0, Math.ceil(Math.min(1, Math.max(0, progress)) * all.length)).join('');
};
