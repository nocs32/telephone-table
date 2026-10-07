import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { PageDrawing } from '../../page';
import { RoomStepPageFit } from '../styled-components';
import { RoomStepWriteBlank, RoomStepWritePromptRoot } from './styled-components';

// What you write about after page one: the drawing you got, as big as the page allows, or a note
// when it's blank.
export const RoomStepWritePrompt = observer(function RoomStepWritePrompt(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { step } = room;

  return (
    <RoomStepWritePromptRoot>
      {step.isDrawingBlank ? (
        <RoomStepWriteBlank>{t('step.blankDrawing')}</RoomStepWriteBlank>
      ) : (
        <RoomStepPageFit>
          <PageDrawing actions={step.drawing} label={t('step.drawingToDescribe')} tilt="left" fill />
        </RoomStepPageFit>
      )}
    </RoomStepWritePromptRoot>
  );
});
