import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { NotebookSpiral, NotebookTurn } from '../../../../ui';
import { RoomStepPage, RoomStepPageBody, RoomStepPageNumber } from '../styled-components';
import { RoomStepWaiting } from '../waiting';
import { RoomStepWriteFirst } from './first';
import { RoomStepWritePrompt } from './prompt';
import { RoomStepWriteSentence } from './sentence';

// A write step (spec §4.3) on a page of the notebook. Page one is the first page of your own book:
// whose it is, your sentence written large and how the game goes on. Later pages show the drawing
// you got, with one line at the bottom to say what it shows. Saved as you type.
export const RoomStepWrite = observer(function RoomStepWrite(): ReactElement {
  const { game, step } = useRootStore().room;

  return (
    <RoomStepPage>
      <NotebookSpiral aria-hidden />
      {step.isFirst ? (
        <RoomStepWriteFirst />
      ) : (
        <>
          <RoomStepPageBody>
            <RoomStepWritePrompt />
          </RoomStepPageBody>
          <RoomStepWriteSentence />
        </>
      )}
      <RoomStepPageNumber aria-hidden>{game.pageNumber}</RoomStepPageNumber>
      {step.state === 'done' && <RoomStepWaiting />}
      <NotebookTurn />
    </RoomStepPage>
  );
});
