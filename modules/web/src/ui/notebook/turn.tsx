import type { ReactElement } from 'react';
import { NotebookTurnBack, NotebookTurnFront, NotebookTurnHalf, NotebookTurnRoot, NotebookTurnSheet, NotebookTurnShadow } from './styled-components';

// The page turn (spec D15): as a new page appears, the one before it curls up from the bottom
// edge and swings up behind the spiral rings, its shadow sweeping off the new page. It plays once, when it mounts: put it inside the page, keyed by
// what the page shows.
export function NotebookTurn(): ReactElement {
  return (
    <NotebookTurnRoot aria-hidden>
      <NotebookTurnShadow />
      <NotebookTurnSheet>
        <NotebookTurnHalf part="top">
          <NotebookTurnFront part="top" />
          <NotebookTurnBack part="top" />
        </NotebookTurnHalf>
        <NotebookTurnHalf part="bottom">
          <NotebookTurnFront part="bottom" />
          <NotebookTurnBack part="bottom" />
        </NotebookTurnHalf>
      </NotebookTurnSheet>
    </NotebookTurnRoot>
  );
}
