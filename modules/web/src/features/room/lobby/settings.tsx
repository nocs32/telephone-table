import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomLobbySettingsLength } from './length';
import { RoomLobbySettingsPoints } from './points';
import { RoomLobbySettingsSlider } from './slider';
import { RoomLobbySettingsStart } from './start';
import { RoomLobbyCard, RoomLobbyCardTitle, RoomLobbySettingsHead, RoomLobbySettingsSubtitle } from './styled-components';
import { RoomLobbySettingsTimes } from './times';

// The shared settings (spec §5.1): anyone may change them, and every change shows in the chat.
export const RoomLobbySettings = observer(function RoomLobbySettings(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { settings } = room.game;

  return (
    <RoomLobbyCard area="settings">
      <RoomLobbySettingsHead>
        <RoomLobbyCardTitle>{t('lobby.title')}</RoomLobbyCardTitle>
        <RoomLobbySettingsSubtitle>{t('lobby.subtitle')}</RoomLobbySettingsSubtitle>
      </RoomLobbySettingsHead>
      <RoomLobbySettingsSlider
        label={t('lobby.rounds')}
        valueText={settings.roundsLabel}
        value={settings.rounds}
        range={settings.limits.rounds}
        step={1}
        disabled={!settings.isEditable}
        onPreview={settings.previewRounds}
        onCommit={settings.commitSliders}
      />
      <RoomLobbySettingsTimes />
      <RoomLobbySettingsLength />
      <RoomLobbySettingsPoints />
      <RoomLobbySettingsStart />
    </RoomLobbyCard>
  );
});
