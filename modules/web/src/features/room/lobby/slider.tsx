import { Slider } from '@ark-ui/react/slider';
import type { ReactElement } from 'react';
import {
  RoomLobbyField,
  RoomLobbyFieldHead,
  RoomLobbyLabel,
  RoomLobbySliderControl,
  RoomLobbySliderRange,
  RoomLobbySliderRoot,
  RoomLobbySliderThumb,
  RoomLobbySliderTrack,
  RoomLobbyValue,
} from './styled-components';

interface RoomLobbySettingsSliderProps {
  label: string;
  valueText: string;
  value: number;
  range: { min: number; max: number };
  step: number;
  disabled: boolean;
  // While dragging; `onCommit` when you let go.
  onPreview: (values: number[]) => void;
  onCommit: () => void;
}

export function RoomLobbySettingsSlider({ label, valueText, value, range, step, disabled, onPreview, onCommit }: RoomLobbySettingsSliderProps): ReactElement {
  return (
    <RoomLobbyField>
      <RoomLobbySliderRoot
        value={[value]}
        min={range.min}
        max={range.max}
        step={step}
        disabled={disabled}
        onValueChange={(details) => onPreview(details.value)}
        onValueChangeEnd={onCommit}
      >
        <RoomLobbyFieldHead>
          <Slider.Label asChild>
            <RoomLobbyLabel>{label}</RoomLobbyLabel>
          </Slider.Label>
          <RoomLobbyValue>{valueText}</RoomLobbyValue>
        </RoomLobbyFieldHead>
        <RoomLobbySliderControl>
          <RoomLobbySliderTrack>
            <RoomLobbySliderRange />
          </RoomLobbySliderTrack>
          <RoomLobbySliderThumb index={0}>
            <Slider.HiddenInput />
          </RoomLobbySliderThumb>
        </RoomLobbySliderControl>
      </RoomLobbySliderRoot>
    </RoomLobbyField>
  );
}
