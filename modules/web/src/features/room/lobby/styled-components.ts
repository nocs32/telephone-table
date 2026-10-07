import { SegmentGroup } from '@ark-ui/react/segment-group';
import { Slider } from '@ark-ui/react/slider';
import { Switch } from '@ark-ui/react/switch';
import { styled } from 'styled-system/jsx';

// Desktop: players | doodle board | settings. Narrower: players, settings, then the doodle board.
// Each lies on the desk: the guest list on a clipboard, the doodle board as a sketch pad, and the
// settings on an index card held by a binder clip.
export const RoomLobbyRoot = styled('div', {
  base: {
    display: 'grid',
    gridTemplateAreas: '"players" "settings" "doodle"',
    gap: '28px 22px',
    paddingInline: '14px',
    paddingTop: '30px',
    paddingBottom: '16px',
    lg: { gridTemplateColumns: '250px minmax(0, 1fr) 340px', gridTemplateAreas: '"players doodle settings"', minHeight: '100%', paddingInline: '22px' },
  },
});

export const RoomLobbyCard = styled('section', {
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    minWidth: '0',
    minHeight: '0',
    padding: '16px',
    color: 'notebook.ink',
    // Backwards only: once it has landed, its own tilt shows.
    animation: 'deal 0.4s cubic-bezier(0.2, 0.8, 0.3, 1.1) backwards',
    _motionReduce: { animation: 'none' },
  },
  variants: {
    area: {
      // A hardboard clipboard (public/textures/hardboard.svg), with a ruler printed down its edge: the
      // sheet of paper lies on it under a chrome lever clip.
      players: {
        gridArea: 'players',
        alignSelf: 'start',
        maxHeight: '100%',
        paddingTop: '30px',
        paddingInline: '11px',
        paddingBottom: '13px',
        borderRadius: '14px',
        bg: '#7A5A3D',
        bgImage: "linear-gradient(115deg, rgba(255, 255, 255, 0.13), transparent 32%, transparent 68%, rgba(0, 0, 0, 0.16)), linear-gradient(rgba(255, 248, 235, 0.4) 1px, transparent 1px), url('/textures/hardboard.svg')",
        bgSize: '100% 100%, 5px 8px, 320px 320px',
        bgPosition: '0 0, 3px 34px, 0 0',
        bgRepeat: 'no-repeat, repeat-y, repeat',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 -2px 1px rgba(0, 0, 0, 0.28), inset 1px 0 0 rgba(255, 255, 255, 0.08), 0 1px 0 rgba(0, 0, 0, 0.5), 0 18px 30px -10px rgba(0, 0, 0, 0.6), 0 3px 6px rgba(0, 0, 0, 0.35)',
        transform: 'rotate(-1.2deg)',
        _before: { content: '""', position: 'absolute', zIndex: '2', top: '8px', left: '50%', width: '128px', height: '34px', marginLeft: '-64px', borderRadius: '6px 6px 12px 12px', bgImage: 'radial-gradient(circle at 15px 55%, #5F5F5B 0 2.5px, #EDEDE9 3px 4px, transparent 4.5px), radial-gradient(circle at calc(100% - 15px) 55%, #5F5F5B 0 2.5px, #EDEDE9 3px 4px, transparent 4.5px), linear-gradient(#FBFBF9, #D2D2CD 38%, #9C9C97 52%, #CFCFCA 78%, #A9A9A4)', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 4px 5px rgba(0, 0, 0, 0.35), 0 1px 1px rgba(0, 0, 0, 0.4)' },
        _after: { content: '""', position: 'absolute', zIndex: '3', top: '-6px', left: '50%', width: '78px', height: '24px', marginLeft: '-39px', borderRadius: '14px 14px 5px 5px', bgImage: 'linear-gradient(#FFFFFF, #CACAC5 45%, #8E8E89 60%, #C4C4BF)', boxShadow: '0 3px 4px rgba(0, 0, 0, 0.35)', maskImage: 'radial-gradient(ellipse 20px 5px at 50% 42%, transparent 96%, black 100%)' },
      },
      // A sketch pad: a chipboard back (public/textures/chipboard.svg), the spiral along the top, and
      // the board as its page.
      doodle: {
        gridArea: 'doodle',
        paddingTop: '26px',
        borderRadius: '6px',
        bg: '#A98C6C',
        bgImage: "linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent 45%, rgba(0, 0, 0, 0.08)), url('/textures/chipboard.svg')",
        bgSize: '100% 100%, 300px 300px',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 0 0 1px rgba(0, 0, 0, 0.12), 0 18px 30px -10px rgba(0, 0, 0, 0.6), 0 3px 6px rgba(0, 0, 0, 0.35)',
        animationDelay: '0.06s',
      },
      // An index card: a red line under the title, blue lines below, and a binder clip on top.
      settings: {
        gridArea: 'settings',
        alignSelf: 'start',
        paddingTop: '20px',
        borderRadius: '4px',
        bg: 'stationery.card',
        bgImage: 'linear-gradient(transparent 70px, {colors.stationery.cardTop} 70px 72px, transparent 72px), repeating-linear-gradient(transparent 0 27px, rgba(202, 220, 235, 0.55) 27px 28px)',
        bgPosition: '0 0, 0 72px',
        boxShadow: '0 18px 30px -10px rgba(0, 0, 0, 0.6), 0 3px 6px rgba(0, 0, 0, 0.35)',
        animationDelay: '0.12s',
        _before: { content: '""', position: 'absolute', top: '-12px', left: '50%', width: '74px', height: '22px', marginLeft: '-37px', borderRadius: '3px 3px 6px 6px', bgImage: 'linear-gradient(#3A3A38, #141413)', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)' },
        _after: { content: '""', position: 'absolute', top: '-30px', left: '50%', width: '50px', height: '22px', marginLeft: '-25px', borderRadius: '12px 12px 0 0', border: '3px solid #C9C9C3', borderBottom: 'none' },
      },
    },
  },
});

export const RoomLobbyCardTitle = styled('h2', {
  base: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px', fontWeight: '900', '& svg': { width: '18px', height: '18px', color: 'notebook.muted' } },
});

// The sheet of paper on the clipboard, under the clip.
export const RoomLobbyPlayersSheet = styled('div', {
  base: { position: 'relative', zIndex: '1', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '0', paddingTop: '22px', paddingInline: '14px', paddingBottom: '12px', borderRadius: '2px', bg: 'stationery.card', bgImage: 'repeating-linear-gradient(transparent 0 21px, {colors.stationery.cardRule} 21px 22px)', bgPosition: '0 6px', boxShadow: '0 1px 1px rgba(0, 0, 0, 0.18), 0 3px 8px rgba(0, 0, 0, 0.28)' },
});

export const RoomLobbyPlayersList = styled('ul', {
  base: { display: 'flex', flexWrap: 'wrap', gap: '6px 16px', lg: { flexDirection: 'column', flexWrap: 'nowrap', gap: '0', overflowY: 'auto' } },
});

export const RoomLobbyPlayersItem = styled('li', {
  base: { display: 'flex', alignItems: 'center', gap: '10px', minHeight: '44px', paddingInline: '2px', animation: 'dialogIn 0.3s ease-out' },
});

export const RoomLobbyPlayersName = styled('span', {
  base: { minWidth: '0', fontSize: '15px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomLobbyPlayersNote = styled('span', {
  base: { fontSize: '12px', fontWeight: '700', color: 'notebook.muted' },
});

// "Waiting for 2 more": a sticky note on the list.
export const RoomLobbyPlayersWaiting = styled('p', {
  base: { padding: '10px 12px', bg: 'stationery.sticky', boxShadow: 'sheet', fontSize: '13px', fontWeight: '900', textAlign: 'center', transform: 'rotate(-2deg)', animation: 'noteIn 0.4s ease-out both' },
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
    bg: 'notebook.paper',
    color: 'notebook.ink',
    fontSize: '13px',
    fontWeight: '900',
    boxShadow: '0 2px 0 #BDB49F, 0 4px 8px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    transition: 'transform 0.1s ease',
    _hover: { transform: 'translateY(-1px)', '& span': { animation: 'roll 0.5s ease-out' } },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    '& span': { display: 'inline-block', fontFamily: 'emoji', fontSize: '16px' },
  },
});

// On desktop the board fits the space both ways.
export const RoomLobbyDoodleArea = styled('div', {
  base: { display: 'grid', placeItems: 'center', lg: { flex: '1', minHeight: '0', containerType: 'size' } },
});

// The drawing tools, on the same floating tray as in a draw step.
export const RoomLobbyDoodleTray = styled('div', {
  base: { alignSelf: 'center', paddingInline: '10px', paddingBlock: '6px', borderRadius: '14px', bg: 'bg.surface', color: 'fg.default', boxShadow: 'floating' },
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
    bg: 'stationery.sticky',
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
  base: { fontSize: '13px', color: 'notebook.muted' },
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
  base: { fontSize: '14px', fontWeight: '900', color: 'accent.default', fontVariantNumeric: 'tabular-nums' },
});

export const RoomLobbyHint = styled('span', {
  base: { fontSize: '12px', color: 'notebook.muted' },
});

export const RoomLobbySliderRoot = styled(Slider.Root, {
  base: { display: 'grid', gap: '10px', '&[data-disabled]': { opacity: '0.55' } },
});

export const RoomLobbySliderControl = styled(Slider.Control, {
  base: { position: 'relative', display: 'flex', alignItems: 'center', height: '20px' },
});

export const RoomLobbySliderTrack = styled(Slider.Track, {
  base: { flex: '1', height: '6px', borderRadius: 'full', bg: 'rgba(38, 37, 31, 0.14)', overflow: 'hidden' },
});

export const RoomLobbySliderRange = styled(Slider.Range, {
  base: { height: '100%', bg: 'accent.default' },
});

export const RoomLobbySliderThumb = styled(Slider.Thumb, {
  base: {
    width: '20px',
    height: '20px',
    borderRadius: 'full',
    bg: 'white',
    border: '3px solid',
    borderColor: 'accent.default',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
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
    borderColor: 'rgba(38, 37, 31, 0.22)',
    bg: 'white',
    fontSize: '14px',
    fontWeight: '900',
    cursor: 'pointer',
    '&[data-state=checked]': { borderColor: 'transparent', bg: 'transparent', color: 'fg.onAccent' },
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
    bg: 'rgba(38, 37, 31, 0.2)',
    transition: 'background-color 0.15s ease',
    '&[data-state=checked]': { bg: 'accent.default' },
    '&[data-focus-visible]': { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
});

export const RoomLobbySwitchThumb = styled(Switch.Thumb, {
  base: { width: '20px', height: '20px', borderRadius: 'full', bg: 'white', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)', transition: 'transform 0.15s ease', '&[data-state=checked]': { transform: 'translateX(16px)' } },
});

export const RoomLobbyStartRoot = styled('footer', {
  base: { display: 'grid', gap: '10px', marginTop: 'auto', paddingTop: '14px', borderTop: '2px dashed', borderColor: 'rgba(38, 37, 31, 0.18)' },
});

export const RoomLobbyStartHint = styled('p', {
  base: { fontSize: '13px', fontWeight: '700', color: 'notebook.muted' },
});

export const RoomLobbyStartButtons = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', gap: '8px', '& > button:last-child': { flex: '1' } },
});
