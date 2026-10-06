import { SegmentGroup } from '@ark-ui/react/segment-group';
import { Slider } from '@ark-ui/react/slider';
import { Switch } from '@ark-ui/react/switch';
import { styled } from 'styled-system/jsx';

// Desktop: players | doodle board | settings. Narrower: players, settings, then the doodle board.
export const RoomLobbyRoot = styled('div', {
  base: {
    display: 'grid',
    gridTemplateAreas: '"players" "settings" "doodle"',
    gap: '12px',
    padding: '12px',
    lg: { gridTemplateColumns: '240px minmax(0, 1fr) 340px', gridTemplateAreas: '"players doodle settings"', height: '100%' },
  },
});

export const RoomLobbyCard = styled('section', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    minWidth: '0',
    minHeight: '0',
    padding: '16px',
    borderRadius: '14px',
    border: '1px solid',
    borderColor: 'chrome.border',
    bg: 'bg.surface',
    animation: 'deal 0.4s cubic-bezier(0.2, 0.8, 0.3, 1.1) both',
  },
  variants: {
    area: {
      players: { gridArea: 'players' },
      doodle: { gridArea: 'doodle', animationDelay: '0.06s' },
      settings: { gridArea: 'settings', animationDelay: '0.12s', lg: { overflowY: 'auto' } },
    },
  },
});

export const RoomLobbyCardTitle = styled('h2', {
  base: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '900', '& svg': { width: '18px', height: '18px', color: 'fg.muted' } },
});

export const RoomLobbyPlayersList = styled('ul', {
  base: { display: 'flex', flexWrap: 'wrap', gap: '6px', lg: { flexDirection: 'column', flexWrap: 'nowrap', overflowY: 'auto' } },
});

export const RoomLobbyPlayersItem = styled('li', {
  base: { display: 'flex', alignItems: 'center', gap: '10px', minHeight: '44px', paddingInline: '8px', paddingBlock: '4px', borderRadius: '10px', bg: 'bg.subtle', animation: 'dialogIn 0.3s ease-out' },
});

export const RoomLobbyPlayersName = styled('span', {
  base: { minWidth: '0', fontSize: '15px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomLobbyPlayersNote = styled('span', {
  base: { fontSize: '12px', color: 'fg.subtle' },
});

export const RoomLobbyPlayersWaiting = styled('p', {
  base: { padding: '10px', borderRadius: '10px', border: '1px dashed', borderColor: 'border.strong', fontSize: '13px', fontWeight: '700', color: 'fg.muted', textAlign: 'center', animation: 'shimmer 2.4s ease-in-out infinite' },
});

export const RoomLobbyDoodleHead = styled('header', {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
});

// The 🎲: a new squiggle on a clean board.
export const RoomLobbyDice = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '32px',
    paddingInline: '12px',
    borderRadius: 'full',
    bg: 'bg.subtle',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease',
    _hover: { bg: 'bg.muted', '& span': { animation: 'roll 0.5s ease-out' } },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    '& span': { display: 'inline-block', fontFamily: 'emoji', fontSize: '16px' },
  },
});

// On desktop the board fits the space both ways.
export const RoomLobbyDoodleArea = styled('div', {
  base: { display: 'grid', placeItems: 'center', lg: { flex: '1', minHeight: '0', containerType: 'size' } },
});

// What the board is for, on a sticky note on the paper (spec D22, D23).
export const RoomLobbyDoodleNote = styled('p', {
  base: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    maxWidth: '44%',
    paddingInline: '12px',
    paddingBlock: '8px',
    bg: 'notebook.tape',
    color: 'notebook.ink',
    fontSize: '14px',
    fontWeight: '900',
    lineHeight: '1.25',
    boxShadow: 'sheet',
    transform: 'rotate(-2deg)',
    pointerEvents: 'none',
    sm: { fontSize: '16px' },
  },
});

export const RoomLobbySettingsHead = styled('header', {
  base: { display: 'grid', gap: '2px' },
});

export const RoomLobbySettingsSubtitle = styled('p', {
  base: { fontSize: '13px', color: 'fg.muted' },
});

export const RoomLobbyField = styled('div', {
  base: { display: 'grid', gap: '8px' },
});

export const RoomLobbyFieldHead = styled('div', {
  base: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' },
});

export const RoomLobbyLabel = styled('label', {
  base: { fontSize: '14px', fontWeight: '700' },
});

export const RoomLobbyValue = styled('span', {
  base: { fontSize: '14px', fontWeight: '900', color: 'accent.text', fontVariantNumeric: 'tabular-nums' },
});

export const RoomLobbyHint = styled('span', {
  base: { fontSize: '12px', color: 'fg.subtle' },
});

export const RoomLobbySliderRoot = styled(Slider.Root, {
  base: { display: 'grid', gap: '10px', '&[data-disabled]': { opacity: '0.55' } },
});

export const RoomLobbySliderControl = styled(Slider.Control, {
  base: { position: 'relative', display: 'flex', alignItems: 'center', height: '20px' },
});

export const RoomLobbySliderTrack = styled(Slider.Track, {
  base: { flex: '1', height: '6px', borderRadius: 'full', bg: 'bg.muted', overflow: 'hidden' },
});

export const RoomLobbySliderRange = styled(Slider.Range, {
  base: { height: '100%', bg: 'accent.default' },
});

export const RoomLobbySliderThumb = styled(Slider.Thumb, {
  base: {
    width: '20px',
    height: '20px',
    borderRadius: 'full',
    bg: 'fg.default',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
    cursor: 'grab',
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
});

export const RoomLobbySegmentRoot = styled(SegmentGroup.Root, {
  base: {
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '4px',
    '& > label:first-child': { width: '100%', marginBottom: '4px' },
    '& > span:last-child': { width: '100%', marginTop: '2px' },
    '&[data-disabled]': { opacity: '0.55' },
  },
});

export const RoomLobbySegmentIndicator = styled(SegmentGroup.Indicator, {
  base: { position: 'absolute', left: 'var(--left)', top: 'var(--top)', width: 'var(--width)', height: 'var(--height)', borderRadius: '8px', bg: 'accent.default', zIndex: '0' },
});

export const RoomLobbySegmentItem = styled(SegmentGroup.Item, {
  base: {
    position: 'relative',
    zIndex: '1',
    display: 'grid',
    placeItems: 'center',
    minWidth: '34px',
    height: '34px',
    paddingInline: '6px',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'border.default',
    fontSize: '14px',
    fontWeight: '900',
    cursor: 'pointer',
    '&[data-state=checked]': { borderColor: 'transparent', color: 'fg.onAccent' },
    '&[data-focus-visible]': { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
  variants: {
    wide: {
      true: { paddingInline: '10px' },
      false: {},
    },
  },
});

export const RoomLobbySwitchRoot = styled(Switch.Root, {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', cursor: 'pointer', '&[data-disabled]': { opacity: '0.55', cursor: 'not-allowed' } },
});

// Ark's own label part: the switch is already a <label>, and labels can't nest.
export const RoomLobbySwitchLabel = styled(Switch.Label, {
  base: { fontSize: '14px', fontWeight: '700' },
});

export const RoomLobbySwitchText = styled('span', {
  base: { display: 'grid', gap: '2px' },
});

export const RoomLobbySwitchControl = styled(Switch.Control, {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: '0',
    width: '40px',
    height: '24px',
    padding: '2px',
    borderRadius: 'full',
    bg: 'bg.muted',
    transition: 'background-color 0.15s ease',
    '&[data-state=checked]': { bg: 'accent.default' },
    '&[data-focus-visible]': { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
});

export const RoomLobbySwitchThumb = styled(Switch.Thumb, {
  base: { width: '20px', height: '20px', borderRadius: 'full', bg: 'fg.default', transition: 'transform 0.15s ease', '&[data-state=checked]': { transform: 'translateX(16px)' } },
});

export const RoomLobbyStartRoot = styled('footer', {
  base: { display: 'grid', gap: '10px', marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid', borderColor: 'border.subtle' },
});

export const RoomLobbyStartHint = styled('p', {
  base: { fontSize: '13px', fontWeight: '700', color: 'fg.muted' },
});

export const RoomLobbyStartButtons = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', gap: '8px', '& > button:last-child': { flex: '1' } },
});
