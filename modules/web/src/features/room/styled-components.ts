import { styled } from 'styled-system/jsx';

export const RoomRoot = styled('div', {
  base: {
    display: 'grid',
    gridTemplateRows: '44px minmax(0, 1fr) auto',
    height: '100dvh',
    bg: 'chrome.app',
    color: 'fg.default',
  },
});

// The stage, with the chat and flying emoji floating over it. Measured, so the chat stays inside.
export const RoomMain = styled('main', {
  base: { position: 'relative', minHeight: '0', overflow: 'hidden' },
});

export const RoomScroll = styled('div', {
  base: {
    height: '100%',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    // A faint dot grid: the table the notebooks lie on.
    bgImage: 'radial-gradient(rgba(255, 251, 237, 0.045) 1px, transparent 1.5px)',
    bgSize: '22px 22px',
  },
});

// Instead of the table, while it opens or when there's none to show.
export const RoomStatusRoot = styled('main', {
  base: { display: 'grid', placeItems: 'center', minHeight: '100dvh', padding: '24px', bg: 'chrome.app', color: 'fg.default' },
});

export const RoomStatusCard = styled('section', {
  base: {
    display: 'grid',
    justifyItems: 'center',
    gap: '12px',
    width: '100%',
    maxWidth: '400px',
    padding: '28px',
    borderRadius: '14px',
    border: '1px solid',
    borderColor: 'chrome.border',
    bg: 'bg.surface',
    boxShadow: 'floating',
    textAlign: 'center',
    animation: 'dialogIn 0.25s ease-out',
  },
});

export const RoomStatusLogo = styled('span', {
  base: { display: 'inline-flex', marginBottom: '4px', '& svg': { width: '44px', height: '44px' } },
});

export const RoomStatusTitle = styled('h1', {
  base: { fontSize: '20px', fontWeight: '900', letterSpacing: '-0.01em' },
});

export const RoomStatusText = styled('p', {
  base: { marginBottom: '8px', fontSize: '15px', color: 'fg.muted', textWrap: 'balance' },
});

export const RoomStatusSpinner = styled('span', {
  base: {
    display: 'inline-flex',
    color: 'accent.text',
    '& svg': { width: '22px', height: '22px', animation: 'spin' },
    _motionReduce: { '& svg': { animation: 'none' } },
  },
});

// A ring that runs down around the seconds left (--left is set by useRoomClockRing).
export const ClockRoot = styled('span', {
  base: {
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    flexShrink: '0',
    width: '52px',
    height: '52px',
    borderRadius: 'full',
    bgImage: 'conic-gradient({colors.accent.default} var(--left, 360deg), {colors.bg.muted} 0)',
    transition: 'transform 0.2s ease',
  },
  variants: {
    urgent: {
      true: { bgImage: 'conic-gradient({colors.danger} var(--left, 360deg), {colors.bg.muted} 0)', animation: 'urgent 1s ease-in-out infinite' },
      false: {},
    },
  },
  defaultVariants: { urgent: false },
});

export const ClockFace = styled('span', {
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '42px',
    height: '42px',
    borderRadius: 'full',
    bg: 'bg.surface',
    fontSize: '18px',
    fontWeight: '900',
    fontVariantNumeric: 'tabular-nums',
  },
});

export const StandingsRoot = styled('ol', {
  base: { display: 'grid', gap: '4px', width: '100%', textAlign: 'left' },
});

export const StandingsItem = styled('li', {
  base: { display: 'flex', alignItems: 'center', gap: '10px', minHeight: '40px', paddingInline: '10px', borderRadius: '8px', fontSize: '15px' },
  variants: {
    me: {
      true: { bg: 'accent.tint' },
      false: {},
    },
  },
  defaultVariants: { me: false },
});

export const StandingsPlace = styled('span', {
  base: { width: '28px', fontSize: '13px', fontWeight: '700', color: 'fg.subtle', fontVariantNumeric: 'tabular-nums' },
});

export const StandingsName = styled('span', {
  base: { flex: '1', minWidth: '0', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const StandingsPoints = styled('span', {
  base: { fontSize: '16px', fontWeight: '900', fontVariantNumeric: 'tabular-nums' },
});

export const RoomBreakRoot = styled('div', {
  base: { display: 'grid', placeItems: 'center', minHeight: '100%', padding: '24px 16px' },
});

export const RoomBreakCard = styled('section', {
  base: {
    display: 'grid',
    justifyItems: 'center',
    gap: '16px',
    width: '100%',
    maxWidth: '440px',
    padding: '28px',
    borderRadius: '16px',
    bg: 'bg.surface',
    boxShadow: 'floating',
    textAlign: 'center',
    animation: 'deal 0.45s cubic-bezier(0.2, 0.8, 0.3, 1.1)',
  },
});

export const RoomBreakTitle = styled('h2', {
  base: { fontSize: '26px', fontWeight: '900', letterSpacing: '-0.02em' },
});

export const RoomBreakNext = styled('p', {
  base: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: '700' },
});

export const RoomBreakHint = styled('p', {
  base: { fontSize: '13px', color: 'fg.subtle', textWrap: 'balance' },
});

export const RoomFlightsRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '6', overflow: 'hidden', pointerEvents: 'none', containerType: 'size' },
});

export const RoomFlightsRise = styled('div', {
  base: {
    position: 'absolute',
    bottom: '12px',
    animation: 'emojiRise 3s cubic-bezier(0.2, 0.6, 0.3, 1) forwards',
    willChange: 'transform, opacity',
    _motionReduce: { animation: 'emojiPop 1.6s ease-out forwards' },
  },
  variants: {
    lane: {
      l1: { left: '14%' },
      l2: { left: '23%' },
      l3: { left: '32%' },
      l4: { left: '41%' },
      l5: { left: '50%' },
      l6: { left: '59%' },
      l7: { left: '68%' },
      l8: { left: '77%' },
      l9: { left: '86%' },
    },
  },
});

export const RoomFlightsSway = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'emoji',
    fontSize: '40px',
    lineHeight: '1',
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))',
    _motionReduce: { animation: 'none' },
  },
  variants: {
    sway: {
      gentle: { animation: 'swayGentle 1.4s ease-in-out infinite alternate' },
      wide: { animation: 'swayWide 1.1s ease-in-out infinite alternate' },
      wobbly: { animation: 'swayWobbly 0.7s ease-in-out infinite alternate' },
    },
  },
});

export const RoomFlightsName = styled('span', {
  base: { marginTop: '4px', paddingInline: '6px', borderRadius: '4px', bg: 'sand.1', color: 'fg.default', fontFamily: 'body', fontSize: '11px', fontWeight: '700' },
});
