// How the recordings play (assets/sounds/credits.md). The board's sounds are Scribble Table's: a
// pencil or eraser loop that follows the line, and a spray for each fill.

export type LoopName = 'pencil' | 'eraser';

interface LoopShape {
  // The loudest it gets, before the volume setting.
  peak: number;
  // Playback speed for a slow line and a fast one: a fast line sounds a touch higher.
  slowRate: number;
  fastRate: number;
}

export interface Loop {
  gain: GainNode;
  source: AudioBufferSourceNode;
  shape: LoopShape;
}

// The tuning, all in one place. The recordings are already evened out.
export const loopShapes: Record<LoopName, LoopShape> = {
  pencil: { peak: 0.9, slowRate: 0.92, fastRate: 1.08 },
  eraser: { peak: 0.5, slowRate: 0.98, fastRate: 1.03 },
};

// Board units per millisecond that count as a fast line: the faster, the louder, up to the peak.
const fastSpeed = 1.2;
const quietest = 0.35;
// Time constants (s) for fading in when the line moves and out when it stops.
const fadeIn = 0.025;
const fadeOut = 0.06;
const sprayLevel = 0.6;

// A recording looping from a random point, silent until something is drawn.
export const startLoop = (context: BaseAudioContext, buffer: AudioBuffer, destination: AudioNode, shape: LoopShape): Loop => {
  const source = context.createBufferSource();
  const gain = context.createGain();

  source.buffer = buffer;
  source.loop = true;
  gain.gain.value = 0;
  source.connect(gain).connect(destination);
  source.start(0, Math.random() * buffer.duration);

  return { gain, source, shape };
};

// `distance` board units drawn over `ms`, from `at`: the loop fades in to a level (and speed) that
// follows how fast the line moves, then fades out unless more comes.
export const scratch = (loop: Loop, at: number, distance: number, ms: number): void => {
  const { gain, source, shape } = loop;
  const speed = Math.min(1, distance / Math.max(ms, 1) / fastSpeed);

  gain.gain.cancelScheduledValues(at);
  gain.gain.setValueAtTime(gain.gain.value, at);
  gain.gain.setTargetAtTime(shape.peak * (quietest + (1 - quietest) * speed), at, fadeIn);
  gain.gain.setTargetAtTime(0, at + Math.max(ms, 1) / 1000 + 0.05, fadeOut);
  source.playbackRate.setTargetAtTime(shape.slowRate + (shape.fastRate - shape.slowRate) * speed, at, 0.08);
};

// A recording played once from `at`, at `level` and `rate`.
export const playOnce = (context: BaseAudioContext, buffer: AudioBuffer, destination: AudioNode, at: number, level: number, rate = 1): void => {
  const source = context.createBufferSource();
  const gain = context.createGain();

  source.buffer = buffer;
  source.playbackRate.value = rate;
  gain.gain.value = level;
  source.connect(gain).connect(destination);
  source.start(at);
};

// One spray, a little higher or lower each time so repeats don't sound copied.
export const spray = (context: BaseAudioContext, buffer: AudioBuffer, destination: AudioNode, at: number): void =>
  playOnce(context, buffer, destination, at, sprayLevel, 0.94 + Math.random() * 0.12);
