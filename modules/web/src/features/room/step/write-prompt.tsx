import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { PageDrawing } from '../page';
import { RoomStepWriteBlank, RoomStepWriteDice, RoomStepWriteIdea, RoomStepWriteIdeaHint, RoomStepWritePromptRoot } from './styled-components';

// What you write about: on page one, your own idea (the 🎲 explains itself, spec D23); later, the
// drawing you got, or a note when it's blank.
export const RoomStepWritePrompt = observer(function RoomStepWritePrompt(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { step } = room;

  return (
    <RoomStepWritePromptRoot>
      {step.isFirst && (
        <RoomStepWriteIdea>
          <RoomStepWriteDice type="button" onClick={step.suggest} disabled={!step.canEdit}>
            <span aria-hidden>🎲</span>
            {t('step.dice')}
          </RoomStepWriteDice>
          <RoomStepWriteIdeaHint>{t('step.diceHint')}</RoomStepWriteIdeaHint>
        </RoomStepWriteIdea>
      )}
      {!step.isFirst && step.isDrawingBlank && <RoomStepWriteBlank>{t('step.blankDrawing')}</RoomStepWriteBlank>}
      {!step.isFirst && !step.isDrawingBlank && <PageDrawing actions={step.drawing} label={t('step.drawingToDescribe')} tilt="left" />}
    </RoomStepWritePromptRoot>
  );
});
