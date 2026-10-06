import { timelapseMs } from '@telephone-table/engine';
import type { BoardAction, StrokeBatch } from '@telephone-table/protocol';
import { DemoPlans } from './plans';
import type { DemoReveal } from './reveal';
import type { DemoRound } from './round';
import { blindGuesses, sketchFor, sketchLines } from './samples';
import { demoDoodleLine, demoSketch, sketchActions } from './sketches';
import { demoSketchNames, isEmptyPage, type DemoDeps, type DemoMember, type DemoPage, type DemoSketchName, type DemoSketchStep } from './types';

// What sample players can do at the table: the same things people do.
export interface DemoBotsHost {
  chat: (memberId: string, text: string) => void;
  react: (memberId: string, emoji: string) => void;
  doodle: (memberId: string, batch: StrokeBatch) => void;
  write: (memberId: string, text: string) => void;
  sketch: (memberId: string, name: DemoSketchName, actions: BoardAction[]) => void;
  done: (memberId: string) => void;
  turnPage: (memberId: string) => void;
  favourite: (memberId: string, pageId: string) => void;
  nextBook: (memberId: string) => void;
  like: (memberId: string, pageId: string) => void;
}

// What sample players type in the chat: their own words, not UI text, so it isn't translated.
const greetings = { en: ['hey all 👋', 'hi! ready when you are'], uk: ['привіт усім 👋', 'всім привіт!'] };
const laughs = ['😂', '🤣', '👏', '🎨', '😮', '💀'];

const pointsPerBatch = 5;
const batchMs = 50;

// Sample players: they greet, doodle in the lobby, write and draw their pages and press Done, like
// pages at the reveal and turn the pages of their own books. They never take over someone else's.
export class DemoBots {
  readonly #deps: DemoDeps;
  readonly #host: DemoBotsHost;
  readonly #plans: DemoPlans<'chat' | 'step' | 'page'>;

  constructor(deps: DemoDeps, host: DemoBotsHost) {
    this.#deps = deps;
    this.#host = host;
    this.#plans = new DemoPlans(deps.schedule);
  }

  cancel(): void {
    this.#plans.cancelAll();
  }

  greet(bot: DemoMember): void {
    this.#plans.later('chat', 1200 + this.#random(2500), () => this.#host.chat(bot.id, this.#pick(greetings[bot.language])));

    if (this.#deps.random() < 0.6) this.#planDoodle(bot, demoDoodleLine(this.#deps.random), 3000 + this.#random(6000));
  }

  // A step began: every sample player with a seat writes or draws, then presses Done.
  planStep(round: DemoRound): void {
    this.#plans.cancel('step');
    round.working.filter((member) => member.isBot).forEach((bot) => (round.kind === 'write' ? this.#write(bot, round) : this.#draw(bot, round)));
  }

  // A page was turned: some like it, some react, and an owner turns their own book on.
  planPage(reveal: DemoReveal, bots: readonly DemoMember[], points: boolean): void {
    const page = reveal.page;

    this.#plans.cancel('page');

    if (!page) return;

    bots.forEach((bot) => {
      if (points && bot.id !== page.author.id && !isEmptyPage(page) && this.#deps.random() < 0.4) this.#plans.later('chat', 1500 + this.#random(3500), () => this.#host.like(bot.id, page.id));

      if (this.#deps.random() < 0.2) this.#plans.later('chat', 800 + this.#random(3000), () => this.#host.react(bot.id, this.#pick(laughs)));
    });

    const owner = bots.find((bot) => bot.id === reveal.book?.owner.id);

    if (owner && reveal.takeover !== 'left') this.#turn(owner, reveal, page, points);
  }

  #write(bot: DemoMember, round: DemoRound): void {
    const prompt = round.promptOf(bot.id);
    const text = round.step === 0 ? sketchLines[this.#pick(demoSketchNames)].opening[bot.language] : this.#describe(bot, prompt);
    const writeAt = 2500 + this.#random(4500);

    this.#plans.later('step', writeAt, () => this.#host.write(bot.id, text));
    this.#plans.later('step', writeAt + 500 + this.#random(1200), () => this.#host.done(bot.id));
  }

  #describe(bot: DemoMember, prompt: DemoPage | null): string {
    const lines = prompt?.sketch ? sketchLines[prompt.sketch].describe[bot.language] : blindGuesses[bot.language];

    return this.#pick(lines);
  }

  #draw(bot: DemoMember, round: DemoRound): void {
    const name = sketchFor(round.promptOf(bot.id)?.text ?? '') ?? this.#pick(demoSketchNames);
    const actions = sketchActions(demoSketch(name), bot.id, this.#deps.createId);

    this.#plans.later('step', 1500 + this.#random(1500), () => this.#host.sketch(bot.id, name, actions));
    this.#plans.later('step', 5000 + this.#random(5000), () => this.#host.done(bot.id));
  }

  // The owner waits for the drawing to finish replaying (or reads the sentence), then turns the
  // page. After the last one they pick a favourite and open the next book.
  #turn(owner: DemoMember, reveal: DemoReveal, page: DemoPage, points: boolean): void {
    const waitMs = (page.kind === 'drawing' ? timelapseMs(page.actions) + 1500 : 2200) + this.#random(1500);

    if (!reveal.isLastPage) {
      this.#plans.later('page', waitMs, () => this.#host.turnPage(owner.id));

      return;
    }

    const others = reveal.book?.pages.filter((candidate) => candidate.author.id !== owner.id) ?? [];
    const favourite = others.length > 0 ? this.#pick(others) : null;

    if (points && favourite) this.#plans.later('page', waitMs, () => this.#host.favourite(owner.id, favourite.id));

    this.#plans.later('page', waitMs + 1800, () => this.#host.nextBook(owner.id));
  }

  // A line on the doodle board, sent in batches at hand speed.
  #planDoodle(bot: DemoMember, step: DemoSketchStep, startMs: number): void {
    if (step.kind !== 'stroke') return;

    const strokeId = this.#deps.createId();

    for (let first = 0; first < step.points.length; first += pointsPerBatch * 2) {
      const points = step.points.slice(first, first + pointsPerBatch * 2);
      const atMs = startMs + (first / (pointsPerBatch * 2)) * batchMs;

      this.#plans.later('chat', atMs, () => this.#host.doodle(bot.id, { strokeId, color: step.color, size: step.size, eraser: false, points }));
    }
  }

  #random(rangeMs: number): number {
    return this.#deps.random() * rangeMs;
  }

  #pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.#deps.random() * items.length)] as T;
  }
}
