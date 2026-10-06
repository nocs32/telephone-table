import { token } from 'styled-system/tokens';
import { BoardPainter, boardPixelHeight, boardPixelWidth } from './board-painter';
import type { BookPicture, BookPicturePage, BookSaverService } from './types';

// A saved book (spec D24): one tall picture, every page stacked top to bottom with its author,
// ready to post in a group chat. Drawn in the browser from the pages it already has.

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

const drawPage = (context: CanvasRenderingContext2D, page: BookPicturePage, top: number): void => {
  context.fillStyle = token(`colors.player.${page.authorColor}`);
  context.beginPath();
  context.arc(margin + 9, top + 12, 9, 0, Math.PI * 2);
  context.fill();
  context.font = font(900, 24);
  context.fillText(page.authorName, margin + 28, top + 21);

  const body = top + 36;

  if (page.kind === 'drawing') {
    context.drawImage(drawingImage(page), margin, body, inner, drawingHeight);
    context.strokeStyle = colors.edge;
    context.lineWidth = 2;
    context.strokeRect(margin, body, inner, drawingHeight);

    return;
  }

  const lines = wrap(context, page.text);

  context.fillStyle = colors.bubble;
  context.beginPath();
  context.roundRect(margin, body, inner, lines.length * lineHeight + 40, 22);
  context.fill();
  context.fillStyle = colors.ink;
  lines.forEach((line, index) => context.fillText(line, margin + 24, body + 20 + (index + 1) * lineHeight - 12));
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
