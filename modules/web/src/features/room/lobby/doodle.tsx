import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { DrawingBoard, DrawingTools } from '../drawing';
import { NotebookSpiral } from '../../../ui';
import { RoomLobbyCard, RoomLobbyCardTitle, RoomLobbyDice, RoomLobbyDoodleArea, RoomLobbyDoodleHead, RoomLobbyDoodleNote, RoomLobbyDoodleTray } from './styled-components';

// The doodle board (spec D22), a sketch pad on the desk: everyone draws on it at once while people
// gather. It says what it's for right on the paper, so nobody has to explain it (spec D23).
export const RoomLobbyDoodle = observer(function RoomLobbyDoodle(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { doodle } = room;

  return (
    <RoomLobbyCard area="doodle" aria-label={t('doodle.title')}>
      <NotebookSpiral aria-hidden />
      <RoomLobbyDoodleHead>
        <RoomLobbyCardTitle>{t('doodle.title')}</RoomLobbyCardTitle>
        <RoomLobbyDice type="button" onClick={doodle.newSquiggle} title={t('doodle.newHint')}>
          <span aria-hidden>🎲</span>
          {t('doodle.new')}
        </RoomLobbyDice>
      </RoomLobbyDoodleHead>
      <RoomLobbyDoodleArea>
        <DrawingBoard board={doodle.board} label={t('doodle.title')} taped>
          <RoomLobbyDoodleNote>{t('doodle.caption')}</RoomLobbyDoodleNote>
        </DrawingBoard>
      </RoomLobbyDoodleArea>
      <RoomLobbyDoodleTray>
        <DrawingTools board={doodle.board} />
      </RoomLobbyDoodleTray>
    </RoomLobbyCard>
  );
});
