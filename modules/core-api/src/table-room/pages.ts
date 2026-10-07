import { sentenceMaxLength, type BoardFill, type StepKind, type StrokeBatch } from '@telephone-table/protocol';
import type { TableRoomPageContent } from './books.js';
import { TableRoomDrawing, type TableRoomDrawingCaps } from './drawing.js';

export interface TableRoomPagesDeps {
  // Throws unless this person may change their page now (their kind of step, not after Done).
  permit: (memberId: string, kind: StepKind) => void;
  caps: TableRoomDrawingCaps;
}

interface TableRoomPagesDraft {
  text: string;
  drawing: TableRoomDrawing;
}

// Everyone's page in this step, saved as they go and passed on to nobody (spec D11): a sentence
// draft, or a drawing's strokes and fills. A reload gets it back with `sync`.
export class TableRoomPages {
  readonly #drafts = new Map<string, TableRoomPagesDraft>();
  readonly #deps: TableRoomPagesDeps;

  constructor(deps: TableRoomPagesDeps) {
    this.#deps = deps;
  }

  write(memberId: string, text: string): void {
    this.#deps.permit(memberId, 'write');
    this.#draft(memberId).text = text.slice(0, sentenceMaxLength);
  }

  stroke(memberId: string, batch: StrokeBatch): void {
    this.#deps.permit(memberId, 'draw');
    this.#draft(memberId).drawing.stroke(memberId, batch);
  }

  fill(memberId: string, fill: BoardFill): void {
    this.#deps.permit(memberId, 'draw');
    this.#draft(memberId).drawing.fill(memberId, fill);
  }

  undo(memberId: string): void {
    this.#deps.permit(memberId, 'draw');
    this.#draft(memberId).drawing.undo(memberId);
  }

  clear(memberId: string): void {
    this.#deps.permit(memberId, 'draw');
    this.#draft(memberId).drawing.reset();
  }

  // What goes into the book when the step ends.
  contentOf(memberId: string): TableRoomPageContent {
    const draft = this.#drafts.get(memberId);

    return { text: draft?.text ?? '', actions: [...(draft?.drawing.actions ?? [])] };
  }

  // The saved draft, for a browser catching up: the drawing as bytes.
  draftOf(memberId: string): { text: string; drawing: Uint8Array } {
    const draft = this.#draft(memberId);

    return { text: draft.text, drawing: draft.drawing.encode() };
  }

  // A new step: everyone starts a blank page.
  reset(): void {
    this.#drafts.clear();
  }

  #draft(memberId: string): TableRoomPagesDraft {
    const draft = this.#drafts.get(memberId) ?? { text: '', drawing: new TableRoomDrawing(this.#deps.caps) };

    this.#drafts.set(memberId, draft);

    return draft;
  }
}
