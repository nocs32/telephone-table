import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { Clock } from '../clock';
import { RoomStepHeaderProgress } from './progress';
import { RoomStepHeaderBadge, RoomStepHeaderMeta, RoomStepHeaderRoot, RoomStepHeaderText, RoomStepHeaderTitle } from './styled-components';

// What this step is (stamped in as it starts), what to do, who's done, and the clock.
export const RoomStepHeader = observer(function RoomStepHeader(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { game, step } = room;
  const kind = game.stepKind ?? 'write';

  return (
    <RoomStepHeaderRoot>
      <RoomStepHeaderBadge kind={kind}>
        <span aria-hidden>{kind === 'draw' ? '🎨' : '✏️'}</span>
        {t(kind === 'draw' ? 'step.draw' : 'step.write')}
      </RoomStepHeaderBadge>
      <RoomStepHeaderText>
        <RoomStepHeaderTitle>{step.isWatching ? t('step.watchingTitle') : step.title}</RoomStepHeaderTitle>
        <RoomStepHeaderMeta>
          {game.roundLabel} · {game.stepLabel}
        </RoomStepHeaderMeta>
      </RoomStepHeaderText>
      <RoomStepHeaderProgress />
      <Clock />
    </RoomStepHeaderRoot>
  );
});
