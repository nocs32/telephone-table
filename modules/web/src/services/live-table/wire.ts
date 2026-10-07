import { decodeDrawing } from '@telephone-table/engine';
import type { PageSnapshot, TablePageWire, TableTaskEvent, TaskSnapshot } from '@telephone-table/protocol';

type TaskWire = NonNullable<TableTaskEvent['task']>;

// Drawings come as bytes (engine `encodeDrawing`); the stores read them as actions.
export const toTask = ({ prompt, draft, ...task }: TaskWire): TaskSnapshot => ({
  ...task,
  prompt: prompt && { kind: prompt.kind, text: prompt.text, actions: decodeDrawing(prompt.drawing) },
  draft: { text: draft.text, actions: decodeDrawing(draft.drawing) },
});

export const toPage = ({ drawing, ...page }: TablePageWire): PageSnapshot => ({ ...page, actions: decodeDrawing(drawing) });
