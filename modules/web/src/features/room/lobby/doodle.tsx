import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { DrawingBoard, DrawingTools } from '../drawing';
import { NotebookSpiral } from '../../../ui';
import {
  RoomLobbyCard,
  RoomLobbyDice,
  RoomLobbyDiceFace,
  RoomLobbyDoodleArea,
  RoomLobbyDoodleHead,
  RoomLobbyDoodleNote,
  RoomLobbyDoodleTitle,
  RoomLobbyDoodleTray,
} from './styled-components';

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
        <RoomLobbyDoodleTitle>{t('doodle.title')}</RoomLobbyDoodleTitle>
        <RoomLobbyDice type="button" onClick={doodle.newSquiggle} title={t('doodle.newHint')}>
          <RoomLobbyDiceFace aria-hidden />
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
