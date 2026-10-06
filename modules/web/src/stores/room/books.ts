import type { BoardAction, BookSnapshot, PageKind, PageSnapshot } from '@telephone-table/protocol';
import { makeAutoObservable, observableShallow } from 'mobx';
import type { BookPicture, BookSaverService } from '../../services';
import type { Translate } from '../locale';
import type { RoomGameStore } from './game';
import type { RoomPresenceStore } from './presence';
import type { PlayerColor, TableSend } from './types';

export interface AuthorView {
  name: string;
  initial: string;
  color: PlayerColor;
}

export type PageAward = 'drawing' | 'line';

export interface PageView {
  id: string;
  bookId: string;
  kind: PageKind;
  // The sentence, or "(nothing written)" (spec §5.2).
  text: string;
  isEmpty: boolean;
  actions: readonly BoardAction[];
  author: AuthorView;
  isMine: boolean;
  // ❤️ (spec §5.5): only while points are on.
  showsLike: boolean;
  likeCount: number;
  liked: boolean;
  canLike: boolean;
  likeLabel: string;
  isFavourite: boolean;
  award: PageAward | null;
}

export interface BookCoverView {
  id: string;
  title: string;
  // The book's first sentence.
  cover: string;
  owner: AuthorView;
  pagesLabel: string;
  saveLabel: string;
}

export interface ShelfRoundView {
  round: number;
  label: string;
  books: BookCoverView[];
}

export interface RoomBooksDeps {
  t: Translate;
  game: RoomGameStore;
  presence: RoomPresenceStore;
  send: TableSend;
  bookSaver: BookSaverService;
}

const authorView = (author: { name: string; color: PlayerColor }): AuthorView => ({ name: author.name, initial: author.name.charAt(0).toUpperCase(), color: author.color });

const fileName = (title: string): string => `${title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/gu, '').toLowerCase() || 'book'}.png`;

// Every page the reveal has turned this game, kept by this browser (they arrive one by one and
// nobody gets them twice), the likes on them, and the books as the shelf shows them.
export class RoomBooksStore {
  pages: PageSnapshot[] = [];
  readonly #deps: RoomBooksDeps;

  constructor(deps: RoomBooksDeps) {
    this.#deps = deps;
    // viewsOf is read inside other stores' computeds, so it stays a plain (tracked) function.
    makeAutoObservable(this, { pages: observableShallow, viewsOf: false }, { autoBind: true });
  }

  get books(): ReadonlyMap<string, BookSnapshot> {
    return new Map(this.#deps.game.books.map((book) => [book.id, book]));
  }

  // Each book's pages, in order.
  get pagesByBook(): ReadonlyMap<string, PageSnapshot[]> {
    const byBook = new Map<string, PageSnapshot[]>();

    this.pages.forEach((page) => byBook.set(page.bookId, [...(byBook.get(page.bookId) ?? []), page]));
    byBook.forEach((pages) => pages.sort((a, b) => a.index - b.index));

    return byBook;
  }

  get pageViews(): ReadonlyMap<string, PageView> {
    return new Map(this.pages.map((page) => [page.id, this.#toView(page)]));
  }

  // The shelf (spec §4.7): every book, grouped by round.
  get rounds(): ShelfRoundView[] {
    const rounds = [...new Set(this.#deps.game.books.map((book) => book.round))];

    return rounds.map((round) => ({
      round,
      label: this.#deps.t('shelf.round', { round }),
      books: this.#deps.game.books.filter((book) => book.round === round).map((book) => this.#toCover(book)),
    }));
  }

  viewsOf(bookId: string, count?: number): PageView[] {
    const pages = (this.pagesByBook.get(bookId) ?? []).slice(0, count);

    return pages.flatMap((page) => this.pageViews.get(page.id) ?? []);
  }

  receivePage(page: PageSnapshot): void {
    if (!this.pages.some((known) => known.id === page.id)) this.pages = [...this.pages, page];
  }

  // Play again: the books are gone (spec §4.7).
  prune(): void {
    if (this.#deps.game.books.length === 0 && this.pages.length > 0) this.pages = [];
  }

  toggleLike(pageId: string): void {
    const view = this.pageViews.get(pageId);

    if (view?.canLike) this.#deps.send('like', { pageId, liked: !view.liked });
  }

  save(bookId: string): void {
    const picture = this.#picture(bookId);

    if (picture) void this.#deps.bookSaver.save(picture);
  }

  #picture(bookId: string): BookPicture | null {
    const book = this.books.get(bookId);
    const { t } = this.#deps;

    if (!book) return null;

    const title = t('book.title', { name: book.owner.name });
    const pages = this.viewsOf(bookId).map((view) => ({ kind: view.kind, authorName: view.author.name, authorColor: view.author.color, text: view.text, actions: view.actions }));

    return { title, subtitle: t('book.subtitle', { round: book.round }), pages, fileName: fileName(title) };
  }

  #toCover(book: BookSnapshot): BookCoverView {
    const { t } = this.#deps;
    const first = this.pagesByBook.get(book.id)?.[0];

    return {
      id: book.id,
      title: t('book.title', { name: book.owner.name }),
      cover: first?.text || t('page.nothingWritten'),
      owner: authorView(book.owner),
      pagesLabel: t('book.pages', { count: book.pageCount }),
      saveLabel: t('book.save'),
    };
  }

  #toView(page: PageSnapshot): PageView {
    const { t, game, presence } = this.#deps;
    const likers = game.likes[page.id] ?? [];
    const isMine = page.author.id === presence.meId;
    const liked = likers.includes(presence.meId);
    const awards = game.awards;

    return {
      id: page.id,
      bookId: page.bookId,
      kind: page.kind,
      text: page.kind === 'sentence' && !page.text ? t('page.nothingWritten') : page.text,
      isEmpty: page.kind === 'sentence' ? !page.text : page.actions.length === 0,
      actions: page.actions,
      author: authorView(presence.find(page.author.id) ?? page.author),
      isMine,
      showsLike: game.settings.points,
      likeCount: likers.length,
      liked,
      canLike: game.settings.points && !isMine,
      likeLabel: isMine ? t('page.yourLikes', { count: likers.length }) : t(liked ? 'page.unlike' : 'page.like', { count: likers.length }),
      isFavourite: this.books.get(page.bookId)?.favouritePageId === page.id,
      award: awards?.drawing.includes(page.id) ? 'drawing' : awards?.line.includes(page.id) ? 'line' : null,
    };
  }
}
