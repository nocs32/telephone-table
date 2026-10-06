import { SegmentGroup } from '@ark-ui/react/segment-group';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomLobbyHint, RoomLobbyLabel, RoomLobbySegmentIndicator, RoomLobbySegmentItem, RoomLobbySegmentRoot } from './styled-components';

// Book length (spec §4.4): one page per player, or shorter books of 3 to 11 pages.
export const RoomLobbySettingsLength = observer(function RoomLobbySettingsLength(): ReactElement {
  const { locale, room } = useRootStore();
  const { settings } = room.game;

  return (
    <RoomLobbySegmentRoot value={settings.bookLengthValue} disabled={!settings.isEditable} onValueChange={(details) => settings.chooseBookLength(details.value)}>
      <SegmentGroup.Label asChild>
        <RoomLobbyLabel>{locale.t('lobby.bookLength')}</RoomLobbyLabel>
      </SegmentGroup.Label>
      <RoomLobbySegmentIndicator />
      {settings.bookLengthOptions.map((option) => (
        <RoomLobbySegmentItem key={option.value} value={option.value} wide={option.value === 'everyone'}>
          <SegmentGroup.ItemText>{option.label}</SegmentGroup.ItemText>
          <SegmentGroup.ItemControl />
          <SegmentGroup.ItemHiddenInput />
        </RoomLobbySegmentItem>
      ))}
      <RoomLobbyHint>{settings.bookLengthHint}</RoomLobbyHint>
    </RoomLobbySegmentRoot>
  );
});
