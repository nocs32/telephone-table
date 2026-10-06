import { token } from 'styled-system/tokens';
import { BoardPainter, boardPixelHeight, boardPixelWidth } from './board-painter';
import type { BookPicture, BookPicturePage, BookSaverService } from './types';

// A saved book (spec D24): one tall picture, every page stacked top to bottom with its author and
// its stickers (spec D25), ready to post in a group chat. Drawn in the browser from the pages it
// already has.

const width = 1080;
const margin = 56;
const inner = width - margin * 2;
const drawingHeight = Math.round((inner * boardPixelHeight) / boardPixelWidth);
const gap = 40;
const lineHeight = 46;
const font = (weight: number, size: number): string => `${weight} ${size}px Lato, sans-serif`;

const colors = {
  paper: token('colors.notebook.paper'),
  ink: token('colors.notebook.ink'),
  muted: token('colors.notebook.muted'),
  bubble: token('colors.notebook.bubble'),
  edge: token('colors.notebook.rule'),
};

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Stickers on a drawing scale with it, as on screen; on a speech bubble they keep one size.
const drawingStickerShare = 0.09;
const bubbleStickerSize = 52;

const wrap = (context: CanvasRenderingContext2D, text: string): string[] => {
  context.font = font(700, 34);

  return text.split(/\s+/u).reduce<string[]>((lines, word) => {
    const last = lines.at(-1);
    const joined = last === undefined ? word : `${last} ${word}`;

    if (last !== undefined && context.measureText(joined).width > inner - 48) return [...lines, word];

    return [...lines.slice(0, -1), joined];
  }, []);
};

const pageHeight = (context: CanvasRenderingContext2D, page: BookPicturePage): number =>
  36 + (page.kind === 'drawing' ? drawingHeight : wrap(context, page.text).length * lineHeight + 40);

// The drawing, painted at board resolution and then scaled into the picture.
const drawingImage = (page: BookPicturePage): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });

  canvas.width = boardPixelWidth;
  canvas.height = boardPixelHeight;

  if (context) new BoardPainter(context).sync(page.actions, 0);

  return canvas;
};

// A sticker as on screen: the emoji with a white die-cut edge, from a small canvas of its own.
const stickerImage = (sticker: string, size: number): HTMLCanvasElement => {
  const side = Math.ceil(size * 1.4);
  const [art, cut] = [document.createElement('canvas'), document.createElement('canvas')];

  [art, cut].forEach((canvas) => Object.assign(canvas, { width: side, height: side }));

  const artContext = art.getContext('2d');
  const cutContext = cut.getContext('2d');

  if (!artContext || !cutContext) return art;

  Object.assign(artContext, { font: `${size}px ${token('fonts.emoji')}`, textAlign: 'center', textBaseline: 'middle' });
  artContext.fillText(sticker, side / 2, side / 2);

  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
    cutContext.drawImage(art, Math.cos(angle) * size * 0.07, Math.sin(angle) * size * 0.07);
  }

  Object.assign(cutContext, { globalCompositeOperation: 'source-in', fillStyle: colors.bubble });
  cutContext.fillRect(0, 0, side, side);
  cutContext.globalCompositeOperation = 'source-over';
  cutContext.drawImage(art, 0, 0);

  return cut;
};

const drawStickers = (context: CanvasRenderingContext2D, page: BookPicturePage, box: Box, size: number): void => {
  page.stickers.forEach(({ sticker, x, y, tilt }) => {
    const image = stickerImage(sticker, size);

    context.save();
    context.translate(box.x + x * box.width, box.y + y * box.height);
    context.rotate((tilt * Math.PI) / 180);
    Object.assign(context, { shadowColor: 'rgba(38, 37, 31, 0.35)', shadowBlur: 8, shadowOffsetY: 3 });
    context.drawImage(image, -image.width / 2, -image.height / 2);
    context.restore();
  });
};

const drawAuthor = (context: CanvasRenderingContext2D, page: BookPicturePage, top: number): void => {
  context.fillStyle = token(`colors.player.${page.authorColor}`);
  context.beginPath();
  context.arc(margin + 9, top + 12, 9, 0, Math.PI * 2);
  context.fill();
  context.font = font(900, 24);
  context.fillText(page.authorName, margin + 28, top + 21);
};

// A sentence in a speech bubble as wide as its longest line, as on screen.
const drawBubble = (context: CanvasRenderingContext2D, page: BookPicturePage, body: number): void => {
  const lines = wrap(context, page.text);
  const longest = Math.max(...lines.map((line) => context.measureText(line).width));
  const box = { x: margin, y: body, width: Math.min(inner, longest + 48), height: lines.length * lineHeight + 40 };

  context.fillStyle = colors.bubble;
  context.beginPath();
  context.roundRect(box.x, box.y, box.width, box.height, [6, 22, 22, 22]);
  context.fill();
  context.fillStyle = colors.ink;
  lines.forEach((line, index) => context.fillText(line, margin + 24, body + 20 + (index + 1) * lineHeight - 12));
  drawStickers(context, page, box, bubbleStickerSize);
};

const drawPage = (context: CanvasRenderingContext2D, page: BookPicturePage, top: number): void => {
  const body = top + 36;

  drawAuthor(context, page, top);

  if (page.kind === 'sentence') {
    drawBubble(context, page, body);

    return;
  }

  context.drawImage(drawingImage(page), margin, body, inner, drawingHeight);
  context.strokeStyle = colors.edge;
  context.lineWidth = 2;
  context.strokeRect(margin, body, inner, drawingHeight);
  drawStickers(context, page, { x: margin, y: body, width: inner, height: drawingHeight }, inner * drawingStickerShare);
};

const drawBook = (canvas: HTMLCanvasElement, book: BookPicture): void => {
  const context = canvas.getContext('2d');

  if (!context) return;

  const heights = book.pages.map((page) => pageHeight(context, page));

  canvas.width = width;
  canvas.height = margin * 2 + 110 + heights.reduce((sum, height) => sum + height + gap, 0);
  context.fillStyle = colors.paper;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = colors.ink;
  context.font = font(900, 48);
  context.fillText(book.title, margin, margin + 44);
  context.fillStyle = colors.muted;
  context.font = font(700, 24);
  context.fillText(book.subtitle, margin, margin + 84);

  heights.reduce((top, height, index) => {
    const page = book.pages[index];

    if (page) drawPage(context, page, top);

    return top + height + gap;
  }, margin + 130);
};

const download = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const createBookSaver = (): BookSaverService => ({
  save: async (book) => {
    await document.fonts.load(font(900, 48));

    const canvas = document.createElement('canvas');

    drawBook(canvas, book);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));

    if (blob) download(blob, book.fileName);
  },
});
