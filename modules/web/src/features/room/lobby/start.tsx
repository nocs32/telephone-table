import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LinkIcon, PlayIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { RoomLobbyStartButtons, RoomLobbyStartHint, RoomLobbyStartRoot } from './styled-components';

// Start works once three people are in (spec §4.2); anyone may press it.
export const RoomLobbySettingsStart = observer(function RoomLobbySettingsStart(): ReactElement {
  const { locale, room } = useRootStore();
  const { game, share } = room;

  return (
    <RoomLobbyStartRoot>
      <RoomLobbyStartHint>{game.startHint}</RoomLobbyStartHint>
      <RoomLobbyStartButtons>
        <Button tone="secondary" type="button" onClick={share.copy}>
          <LinkIcon />
          {share.inviteLabel}
        </Button>
        <Button tone="primary" type="button" disabled={!game.canStart} onClick={game.start}>
          <PlayIcon />
          {locale.t('lobby.start')}
        </Button>
      </RoomLobbyStartButtons>
    </RoomLobbyStartRoot>
  );
});
