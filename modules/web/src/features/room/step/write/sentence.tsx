import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CheckIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { Button } from '../../../../ui';
import { withoutDefault } from '../../../../utils';
import { RoomStepWriteCounter, RoomStepWriteField, RoomStepWriteForm, RoomStepWriteInput } from './styled-components';

interface RoomStepWriteSentenceProps {
  // Page one: written large, in the middle of the page.
  big?: boolean;
}

// The line you write on, and Done.
export const RoomStepWriteSentence = observer(function RoomStepWriteSentence({ big = false }: RoomStepWriteSentenceProps): ReactElement {
  const { locale, room } = useRootStore();
  const { step } = room;

  return (
    <RoomStepWriteForm big={big} onSubmit={withoutDefault(step.done)}>
      <RoomStepWriteField>
        <RoomStepWriteInput
          big={big}
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
  );
});
