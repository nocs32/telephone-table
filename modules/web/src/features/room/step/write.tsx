import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CheckIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button, NotebookSpiral, NotebookTurn } from '../../../ui';
import { withoutDefault } from '../../../utils';
import { RoomStepPage, RoomStepPageBody, RoomStepWriteCounter, RoomStepWriteField, RoomStepWriteForm, RoomStepWriteInput } from './styled-components';
import { RoomStepWaiting } from './waiting';
import { RoomStepWritePrompt } from './write-prompt';

// A write step (spec §4.3) on a page of the notebook: page one is your own sentence; later pages say
// what the drawing you got shows. One line at the bottom of the page, saved as you type.
export const RoomStepWrite = observer(function RoomStepWrite(): ReactElement {
  const { locale, room } = useRootStore();
  const { step } = room;

  return (
    <RoomStepPage>
      <NotebookSpiral aria-hidden />
      <RoomStepPageBody>
        <RoomStepWritePrompt />
      </RoomStepPageBody>
      <RoomStepWriteForm onSubmit={withoutDefault(step.done)}>
        <RoomStepWriteField>
          <RoomStepWriteInput
            value={step.text}
            placeholder={step.placeholder}
            aria-label={step.title}
            maxLength={step.maxLength}
            disabled={!step.canEdit}
            autoComplete="off"
            onChange={(event) => step.setText(event.target.value)}
            onBlur={step.saveDraft}
          />
          <RoomStepWriteCounter aria-hidden>{step.counter}</RoomStepWriteCounter>
        </RoomStepWriteField>
        <Button tone="primary" type="submit" disabled={!step.canEdit}>
          <CheckIcon />
          {locale.t('step.done')}
        </Button>
      </RoomStepWriteForm>
      {step.state === 'done' && <RoomStepWaiting />}
      <NotebookTurn />
    </RoomStepPage>
  );
});
