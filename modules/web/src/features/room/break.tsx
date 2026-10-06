import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { PlayIcon } from '../../assets';
import { useRootStore } from '../../stores/use-root-store';
import { Button } from '../../ui';
import { Clock } from './clock';
import { Standings } from './standings';
import { RoomBreakCard, RoomBreakHint, RoomBreakNext, RoomBreakRoot, RoomBreakTitle } from './styled-components';

// Between rounds (spec §4.7): the points so far, then the next round starts by itself after 15
// seconds, or sooner with Start now. With fewer than three people it waits for a third.
export const RoomBreak = observer(function RoomBreak(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { game } = room;

  return (
    <RoomBreakRoot>
      <RoomBreakCard>
        <RoomBreakTitle>{t('break.title', { round: game.round })}</RoomBreakTitle>
        {game.settings.points && <Standings />}
        <RoomBreakNext aria-live="polite">
          {game.clock.isRunning && <Clock />}
          {game.breakLabel}
        </RoomBreakNext>
        <Button tone="primary" type="button" disabled={!game.canStartNow} onClick={game.startNow}>
          <PlayIcon />
          {t('break.startNow')}
        </Button>
        <RoomBreakHint>{t('break.hint')}</RoomBreakHint>
      </RoomBreakCard>
    </RoomBreakRoot>
  );
});
