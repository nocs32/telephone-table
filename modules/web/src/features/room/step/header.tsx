import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { PaintBucketIcon, PencilIcon } from '../../../assets';
import { Clock } from '../clock';
import { RoomStepHeaderBadge, RoomStepHeaderLabel, RoomStepHeaderMeta, RoomStepHeaderRoot, RoomStepHeaderText, RoomStepHeaderTitle } from './styled-components';

// What this step is (stamped on a label as it starts), what to do, written on the mat, and the
// kitchen timer. Who's done is a sticky note beside the page.
export const RoomStepHeader = observer(function RoomStepHeader(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { game, step } = room;
  const kind = game.stepKind ?? 'write';

  return (
    <RoomStepHeaderRoot>
      <RoomStepHeaderLabel>
        <RoomStepHeaderBadge kind={kind}>
          {kind === 'draw' ? <PaintBucketIcon /> : <PencilIcon />}
          {t(kind === 'draw' ? 'step.draw' : 'step.write')}
        </RoomStepHeaderBadge>
      </RoomStepHeaderLabel>
      <RoomStepHeaderText>
        <RoomStepHeaderTitle>{step.isWatching ? t('step.watchingTitle') : step.title}</RoomStepHeaderTitle>
        <RoomStepHeaderMeta>
          {game.roundLabel} · {game.stepLabel}
        </RoomStepHeaderMeta>
      </RoomStepHeaderText>
      <Clock />
    </RoomStepHeaderRoot>
  );
});
