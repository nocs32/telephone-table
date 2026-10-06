import type { DemoLanguage, DemoSketchName } from './types';

// What the demo's sample players write: their own sentences, not UI text, so they aren't
// translated. Like the starter sentences, they avoid every word in Scribble Table's lists
// (spec §10), checked by a subagent that reports counts only.

interface SketchLines {
  // Words that ask for this sketch, in either language (Ukrainian ones as stems, to match any ending).
  keywords: readonly string[];
  // Page one, when a sample player starts a book with it.
  opening: Record<DemoLanguage, string>;
  // What a sample player writes when the drawing they get is this sketch.
  describe: Record<DemoLanguage, readonly string[]>;
}

export const sketchLines: Record<DemoSketchName, SketchLines> = {
  snowman: {
    keywords: ['snowman', 'сніговик'],
    opening: { en: 'A snowman melting with great dignity', uk: 'Сніговик тане з неймовірною гідністю' },
    describe: { en: ['A snowman saying hello', 'A very cold gentleman posing'], uk: ['Сніговик махає на привітання', 'Дуже холодний пан позує'] },
  },
  rainbow: {
    keywords: ['rainbow', 'веселк'],
    opening: { en: 'A rainbow that forgot one of its colours', uk: 'Веселка забула один зі своїх кольорів' },
    describe: { en: ['A rainbow after a big storm', 'Somebody spilled every crayon at once'], uk: ['Веселка після сильної зливи', 'Хтось розлив усі фарби одразу'] },
  },
  balloon: {
    keywords: ['balloon', 'кульк'],
    opening: { en: 'A balloon escaping from a fancy party', uk: 'Повітряна кулька тікає зі свята' },
    describe: { en: ['A red balloon floating away', 'A balloon on a very wiggly string'], uk: ['Червона кулька відлітає геть', 'Кулька на дуже звивистій нитці'] },
  },
  glasses: {
    keywords: ['glasses', 'окуляр'],
    opening: { en: 'Glasses that only see the good stuff', uk: 'Окуляри, крізь які видно лише хороше' },
    describe: { en: ['Cool blue glasses', 'Someone very serious who lost their face'], uk: ['Стильні сині окуляри', 'Хтось дуже серйозний загубив обличчя'] },
  },
  lollipop: {
    keywords: ['lollipop', 'льодяник'],
    opening: { en: 'A lollipop bigger than its owner', uk: 'Льодяник, більший за свого власника' },
    describe: { en: ['A swirly lollipop', 'A hypnotising spiral on a stick'], uk: ['Закручений льодяник', 'Гіпнотична спіраль на паличці'] },
  },
  sailboat: {
    keywords: ['sailboat', 'вітрильник'],
    opening: { en: 'A tiny sailboat lost in a puddle', uk: 'Крихітний вітрильник загубився в калюжі' },
    describe: { en: ['A sailboat on a calm lake', 'Sailors on their day off'], uk: ['Вітрильник на спокійному озері', 'Моряки на вихідних'] },
  },
  cactus: {
    keywords: ['cactus', 'кактус'],
    opening: { en: 'A cactus who really wants a cuddle', uk: 'Кактус, який мріє, щоб його пригорнули' },
    describe: { en: ['A cactus striking a pose', 'A prickly friend says hi'], uk: ['Кактус кумедно позує', 'Колючий друг вітається'] },
  },
  candle: {
    keywords: ['candle', 'свічк'],
    opening: { en: 'A candle afraid of the dark', uk: 'Свічка, яка боїться темряви' },
    describe: { en: ['A pink candle glowing', 'A cosy evening, just add tea'], uk: ['Рожева свічка світиться', 'Затишний вечір, бракує лише чаю'] },
  },
  mushroom: {
    keywords: ['mushroom', 'гриб'],
    opening: { en: 'A mushroom showing off its polka dots', uk: 'Гриб хизується своїми горошинками' },
    describe: { en: ['A spotty red mushroom', 'Do not eat this, trust me'], uk: ['Червоний гриб у цятку', 'Це краще не їсти, повірте'] },
  },
  ladder: {
    keywords: ['ladder', 'драбин'],
    opening: { en: 'A ladder that goes up past the rooftops', uk: 'Драбина така висока, що верхівки не видно' },
    describe: { en: ['A wooden ladder', 'Steps to nowhere in particular'], uk: ['Стара хитка драбина', 'Щаблі в нікуди'] },
  },
  kite: {
    keywords: ['kite', 'змій', 'змія', 'змієм'],
    opening: { en: 'A kite pulling grandpa across the field', uk: 'Повітряний змій тягне дідуся через поле' },
    describe: { en: ['A purple kite in a breeze', 'A diamond that learned to fly'], uk: ['Фіолетовий змій ширяє високо', 'Ромб, який навчився літати'] },
  },
  dice: {
    keywords: ['dice', 'кубик'],
    opening: { en: 'Dice arguing about who is luckier', uk: 'Кубики сперечаються, хто щасливіший' },
    describe: { en: ['A dice showing five', 'Somebody is about to win big'], uk: ['Кубик показує п’ять', 'Хтось от-от зірве джекпот'] },
  },
};

// For a drawing that isn't one of the sample sketches: a sample player guesses wildly.
export const blindGuesses: Record<DemoLanguage, readonly string[]> = {
  en: [
    'Modern art, probably very expensive',
    'Something I saw after too much pudding',
    'Somebody is having a wonderful day',
    'No idea, but I love it',
    'A secret map to buried treasure',
    'Monday morning feelings',
    'The view from inside a hurricane',
    'A masterpiece nobody understands',
  ],
  uk: [
    'Сучасне мистецтво, мабуть зовсім недешеве',
    'Таке ввижається після пізньої вечері',
    'Хтось має чудовий день',
    'Гадки не маю, але мені подобається',
    'Таємна мапа до скарбу',
    'Настрій у понеділок зранку',
    'Вигляд зсередини урагану',
    'Шедевр, якого ніхто не розуміє',
  ],
};

// The sketch a sentence asks for, if it names one.
export const sketchFor = (text: string): DemoSketchName | null => {
  const lower = text.toLowerCase();
  const match = Object.entries(sketchLines).find(([, lines]) => lines.keywords.some((keyword) => lower.includes(keyword)));

  return (match?.[0] as DemoSketchName | undefined) ?? null;
};
