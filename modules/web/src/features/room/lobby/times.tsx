import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomLobbySettingsSlider } from './slider';

// How long a write step and a draw step last (spec §5.1).
export const RoomLobbySettingsTimes = observer(function RoomLobbySettingsTimes(): ReactElement {
  const { locale, room } = useRootStore();
  const { settings } = room.game;

  return (
    <>
      <RoomLobbySettingsSlider
        label={locale.t('lobby.writeTime')}
        valueText={settings.writeTimeLabel}
        value={settings.writeSeconds}
        range={settings.limits.writeSeconds}
        step={settings.limits.writeSeconds.step}
        disabled={!settings.isEditable}
        onPreview={settings.previewWriteSeconds}
        onCommit={settings.commitSliders}
      />
      <RoomLobbySettingsSlider
        label={locale.t('lobby.drawTime')}
        valueText={settings.drawTimeLabel}
        value={settings.drawSeconds}
        range={settings.limits.drawSeconds}
        step={settings.limits.drawSeconds.step}
        disabled={!settings.isEditable}
        onPreview={settings.previewDrawSeconds}
        onCommit={settings.commitSliders}
      />
    </>
  );
});
