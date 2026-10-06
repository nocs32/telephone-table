import { soundUrls } from '../assets';
import { createAddress } from './address';
import { createBookSaver } from './book-saver';
import { createDemoTable } from './demo-table';
import { createPreferences } from './preferences';
import { Sounds } from './sounds';
import { createTranslator } from './translator';
import type { Schedule, Services } from './types';

export type {
  AddressService,
  BookPicture,
  BookPicturePage,
  BookSaverService,
  ClipboardService,
  DemoControls,
  PreferencesService,
  Schedule,
  Services,
  SoundPreference,
  SoundsService,
  TableClientService,
  TableConnectionState,
  TableLink,
  TableLinkListeners,
  TableOpenFailure,
  TableOpenResult,
  TranslatorService,
} from './types';

const schedule: Schedule = (callback, delayMs) => {
  const timer = window.setTimeout(callback, delayMs);

  return () => window.clearTimeout(timer);
};

const repeat: Schedule = (callback, intervalMs) => {
  const timer = window.setInterval(callback, intervalMs);

  return () => window.clearInterval(timer);
};

const createId = (): string => crypto.randomUUID();

// Wide enough that the chat floats open beside the game from the start.
const wideLayoutQuery = '(min-width: 1200px)';

export const createServices = (): Services => ({
  preferences: createPreferences(),
  translator: createTranslator(),
  clipboard: { writeText: (text) => navigator.clipboard.writeText(text) },
  address: createAddress(),
  // The demo table: a referee and sample players in the browser, with no server (spec D19). Live
  // tables on core-api come in M2, behind the same TableClientService.
  tableClient: createDemoTable({ schedule, random: Math.random, now: Date.now, createId }),
  sounds: new Sounds(window, soundUrls),
  bookSaver: createBookSaver(),
  schedule,
  repeat,
  random: Math.random,
  now: Date.now,
  createId,
  origin: window.location.origin,
  isWideLayout: window.matchMedia(wideLayoutQuery).matches,
  browserLanguages: navigator.languages.length > 0 ? navigator.languages : [navigator.language],
});
