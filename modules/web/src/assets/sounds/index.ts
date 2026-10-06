// The table's sounds: CC0 recordings from Freesound, cut into short clips (see credits.md).
import type { SoundUrls } from '../../services/sounds';
import chime from './chime.wav';
import eraser from './eraser.wav';
import fanfare from './fanfare.wav';
import pageTurn from './page-turn.wav';
import pencil from './pencil.wav';
import spray from './spray.wav';
import tick from './tick.wav';

export const soundUrls: SoundUrls = { pencil, eraser, spray, chime, tick, pageTurn, fanfare };
