import type { SoundsService } from '../types';
import { loopShapes, playOnce, scratch, spray, startLoop, type Loop, type LoopName } from './board';

// The game's cues (spec §7): a chime when a step starts, a tick in the last ten seconds, a page
// turn at the reveal, a sticker stuck on or peeled off, and a fanfare at the podium.
const cueNames = ['chime', 'tick', 'pageTurn', 'fanfare', 'stick', 'peel'] as const;

type CueName = (typeof cueNames)[number];

export type SoundUrls = Record<LoopName | 'spray' | CueName, string>;

const cueLevels: Record<CueName, number> = { chime: 0.7, tick: 0.6, pageTurn: 0.8, fanfare: 0.7, stick: 0.6, peel: 0.8 };

interface Recordings {
  loops: Record<LoopName, Loop>;
  spray: AudioBuffer;
  cues: Record<CueName, AudioBuffer>;
}

// Everything the table plays, from short CC0 recordings. Browsers allow audio only after a click
// or a key press on the page, so it starts (and loads them) on the first one; until then it's quiet.
export class Sounds implements SoundsService {
  #context: AudioContext | null = null;
  #master: GainNode | null = null;
  #recordings: Recordings | null = null;
  #level = 0;
  readonly #urls: SoundUrls;

  constructor(target: Window, urls: SoundUrls) {
    this.#urls = urls;
    target.addEventListener('pointerdown', this.#unlock, true);
    target.addEventListener('keydown', this.#unlock, true);
  }

  setLevel(level: number): void {
    this.#level = level;

    const context = this.#context;

    if (!context || !this.#master) return;

    // Squared, so the slider feels even to the ear. Muted, the context sleeps.
    this.#master.gain.setTargetAtTime(level * level, context.currentTime, 0.05);
    void (level > 0 ? context.resume() : context.suspend());
  }

  scratch(eraser: boolean, distance: number, ms: number): void {
    const context = this.#running();

    if (context && this.#recordings) scratch(this.#recordings.loops[eraser ? 'eraser' : 'pencil'], context.currentTime, distance, ms);
  }

  spray(): void {
    const context = this.#running();

    if (context && this.#recordings && this.#master) spray(context, this.#recordings.spray, this.#master, context.currentTime);
  }

  chime(): void {
    this.#cue('chime');
  }

  tick(): void {
    this.#cue('tick');
  }

  pageTurn(): void {
    this.#cue('pageTurn');
  }

  fanfare(): void {
    this.#cue('fanfare');
  }

  stick(): void {
    this.#cue('stick');
  }

  peel(): void {
    this.#cue('peel');
  }

  #cue(name: CueName): void {
    const context = this.#running();

    if (context && this.#recordings && this.#master) playOnce(context, this.#recordings.cues[name], this.#master, context.currentTime, cueLevels[name]);
  }

  // The context, when it runs and there's something to hear.
  #running(): AudioContext | null {
    return this.#level > 0 && this.#context?.state === 'running' ? this.#context : null;
  }

  readonly #unlock = (): void => {
    if (!this.#context) this.#start();

    if (this.#level > 0) void this.#context?.resume();
  };

  #start(): void {
    const context = new AudioContext();
    const master = context.createGain();

    master.gain.value = this.#level * this.#level;
    master.connect(context.destination);
    this.#context = context;
    this.#master = master;
    // Without the recordings (offline, say) the table just stays quiet.
    void this.#load(context, master).catch(() => undefined);
  }

  async #load(context: AudioContext, master: GainNode): Promise<void> {
    const decode = async (url: string): Promise<AudioBuffer> => context.decodeAudioData(await (await fetch(url)).arrayBuffer());
    const urls = this.#urls;

    const [pencil, eraser, sprayBuffer] = await Promise.all([urls.pencil, urls.eraser, urls.spray].map(decode));
    const cues = await Promise.all(cueNames.map(async (name) => [name, await decode(urls[name])] as const));

    if (!pencil || !eraser || !sprayBuffer) return;

    this.#recordings = {
      loops: { pencil: startLoop(context, pencil, master, loopShapes.pencil), eraser: startLoop(context, eraser, master, loopShapes.eraser) },
      spray: sprayBuffer,
      cues: Object.fromEntries(cues) as Record<CueName, AudioBuffer>,
    };
  }
}
