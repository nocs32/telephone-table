import type { Language } from '../../i18n';
import { en } from './en';
import { uk } from './uk';

// Suggestions for page one (spec §10). They aren't secret, but they avoid every word in Scribble
// Table's lists, checked by a subagent that reports counts only (see CLAUDE.md).
export const starterSentences: Record<Language, readonly string[]> = { en, uk };
