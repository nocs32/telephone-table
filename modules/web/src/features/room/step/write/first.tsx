import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { Die } from '../../../../ui';
import { RoomStepWriteSentence } from './sentence';
import {
  RoomStepWriteBookplate,
  RoomStepWriteBookplateLabel,
  RoomStepWriteBookplateName,
  RoomStepWriteDice,
  RoomStepWriteFirstMiddle,
  RoomStepWriteFirstRoot,
  RoomStepWriteHow,
  RoomStepWriteHowItem,
  RoomStepWriteHowList,
  RoomStepWriteHowTitle,
  RoomStepWriteIdea,
  RoomStepWriteIdeaHint,
} from './styled-components';

// The first page of your own book: whose it is, your sentence (the die explains itself, spec D23),
// and a sticky note on how the game goes on from here.
export const RoomStepWriteFirst = observer(function RoomStepWriteFirst(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { step } = room;

  return (
    <RoomStepWriteFirstRoot>
      <RoomStepWriteBookplate>
        <RoomStepWriteBookplateLabel>{t('step.belongsTo')}</RoomStepWriteBookplateLabel>
        <RoomStepWriteBookplateName>{step.ownerName}</RoomStepWriteBookplateName>
      </RoomStepWriteBookplate>
      <RoomStepWriteFirstMiddle>
        <RoomStepWriteSentence big />
        <RoomStepWriteIdea>
          <RoomStepWriteDice type="button" onClick={step.suggest} disabled={!step.canEdit}>
            <Die aria-hidden />
            {t('step.dice')}
          </RoomStepWriteDice>
          <RoomStepWriteIdeaHint>{t('step.diceHint')}</RoomStepWriteIdeaHint>
        </RoomStepWriteIdea>
      </RoomStepWriteFirstMiddle>
      <RoomStepWriteHow>
        <RoomStepWriteHowTitle>{t('step.howTitle')}</RoomStepWriteHowTitle>
        <RoomStepWriteHowList>
          {step.howItWorks.map((line) => (
            <RoomStepWriteHowItem key={line}>{line}</RoomStepWriteHowItem>
          ))}
        </RoomStepWriteHowList>
      </RoomStepWriteHow>
    </RoomStepWriteFirstRoot>
  );
});
