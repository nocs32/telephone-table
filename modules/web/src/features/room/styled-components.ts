import { styled } from 'styled-system/jsx';

export const RoomRoot = styled('div', {
  base: {
    display: 'grid',
    gridTemplateRows: '48px minmax(0, 1fr) auto',
    height: '100dvh',
    bg: 'chrome.app',
    color: 'fg.default',
  },
});

// The stage, with the chat and flying emoji floating over it. Measured, so the chat stays inside.
export const RoomMain = styled('main', {
  base: { position: 'relative', minHeight: '0', overflow: 'hidden', bg: 'desk.wood' },
});

// The desk: oak, drawn with noise. Smooth noise cut into thin bands makes the grain lines (and a
// few lighter ones for sheen), with fine fibres and broad patches on top.
export const RoomScroll = styled('div', {
  base: {
    height: '100%',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    bg: 'desk.wood',
    bgImage: `url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1200'%20height='800'%3E%3Cfilter%20id='f'%20x='0'%20y='0'%20width='100%25'%20height='100%25'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.0016%200.03'%20numOctaves='3'%20seed='2'%20stitchTiles='stitch'/%3E%3CfeComponentTransfer%3E%3CfeFuncR%20type='table'%20tableValues='0%200%200.15%201%200.15%200%200%200%200%200.15%201%200.15%200%200%200%200%200.15%201%200.15%200%200%200%200%200.15%201%200.15%200%200%200%200%200.15%201%200.15%200%200%200%200%200.15%201%200.15%200%200%200%200%200.15%201%200.15%200%200%200%200%200.15%201%200.15%200%200%200%200%200.15%201%200.15%200%200%200%200%200.15%201%200.15%200%200%200%200%200.15%201%200.15%200%200%200%200%200.15%201%200.15%200%200%200%200%200.15%201%200.15%200%200%200%200%200.15%201%200.15%200%200'/%3E%3C/feComponentTransfer%3E%3CfeColorMatrix%20values='0%200%200%200%200.16%200%200%200%200%200.12%200%200%200%200%200.08%200.42%200%200%200%200'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url%28%23f%29'/%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1200'%20height='800'%3E%3Cfilter%20id='f'%20x='0'%20y='0'%20width='100%25'%20height='100%25'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.002%200.05'%20numOctaves='2'%20seed='8'%20stitchTiles='stitch'/%3E%3CfeComponentTransfer%3E%3CfeFuncR%20type='table'%20tableValues='0%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%201%200%200'/%3E%3C/feComponentTransfer%3E%3CfeColorMatrix%20values='0%200%200%200%201%200%200%200%200%200.96%200%200%200%200%200.9%200.1%200%200%200%200'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url%28%23f%29'/%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1200'%20height='800'%3E%3Cfilter%20id='f'%20x='0'%20y='0'%20width='100%25'%20height='100%25'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.004%200.9'%20numOctaves='2'%20seed='5'%20stitchTiles='stitch'/%3E%3CfeColorMatrix%20values='0%200%200%200%200.16%200%200%200%200%200.12%200%200%200%200%200.08%200.5%200%200%200%20-0.22'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url%28%23f%29'/%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1200'%20height='800'%3E%3Cfilter%20id='f'%20x='0'%20y='0'%20width='100%25'%20height='100%25'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.0008%200.006'%20numOctaves='2'%20seed='13'%20stitchTiles='stitch'/%3E%3CfeColorMatrix%20values='0%200%200%200%200%200%200%200%200%200%200%200%200%200%200%200.45%200%200%200%20-0.16'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url%28%23f%29'/%3E%3C/svg%3E")`,
    bgSize: '1200px 800px',
    bgAttachment: 'local',
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
    borderRadius: '4px',
    bg: 'stationery.card',
    color: 'notebook.ink',
    boxShadow: 'note',
    textAlign: 'center',
    transform: 'rotate(-0.8deg)',
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
  base: { marginBottom: '8px', fontSize: '15px', color: 'notebook.muted', textWrap: 'balance' },
});

export const RoomStatusSpinner = styled('span', {
  base: {
    display: 'inline-flex',
    color: 'accent.default',
    '& svg': { width: '22px', height: '22px', animation: 'spin' },
    _motionReduce: { '& svg': { animation: 'none' } },
  },
});

// A kitchen timer: the red wedge is the time left (--left is set by useRoomClockRing), with ticks
// round the rim and a knob on top. It rings in the last ten seconds.
export const ClockRoot = styled('span', {
  base: {
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    flexShrink: '0',
    width: '58px',
    height: '58px',
    marginTop: '6px',
    borderRadius: 'full',
    bgImage: 'conic-gradient({colors.stationery.stamp} var(--left, 360deg), {colors.notebook.paperShade} 0)',
    boxShadow: '0 0 0 4px {colors.notebook.paper}, 0 0 0 5px rgba(0, 0, 0, 0.25), 0 8px 16px rgba(0, 0, 0, 0.5)',
    transformOrigin: '50% 0',
    _before: {
      content: '""',
      position: 'absolute',
      top: '-12px',
      left: '50%',
      width: '14px',
      height: '8px',
      marginLeft: '-7px',
      borderRadius: '4px 4px 1px 1px',
      bg: 'notebook.paper',
      boxShadow: '0 -1px 0 rgba(0, 0, 0, 0.2) inset',
    },
    _after: {
      content: '""',
      position: 'absolute',
      inset: '0',
      borderRadius: 'full',
      bgImage: 'repeating-conic-gradient(rgba(38, 37, 31, 0.5) 0 2deg, transparent 2deg 30deg)',
      maskImage: 'radial-gradient(circle, transparent 66%, black 67%)',
      pointerEvents: 'none',
    },
  },
  variants: {
    urgent: {
      true: { animation: 'ring 0.6s ease-in-out infinite', _motionReduce: { animation: 'none' } },
      false: {},
    },
  },
  defaultVariants: { urgent: false },
});

export const ClockFace = styled('span', {
  base: {
    zIndex: '1',
    display: 'grid',
    placeItems: 'center',
    width: '34px',
    height: '34px',
    borderRadius: 'full',
    bg: 'notebook.paper',
    color: 'notebook.ink',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
    fontSize: '16px',
    fontWeight: '900',
    lineHeight: '1',
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
      true: { bg: 'rgba(91, 91, 214, 0.12)' },
      false: {},
    },
  },
  defaultVariants: { me: false },
});

export const StandingsPlace = styled('span', {
  base: { width: '28px', fontSize: '13px', fontWeight: '700', color: 'notebook.muted', fontVariantNumeric: 'tabular-nums' },
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

// The scores so far, kept on an index card: a red line under the title and blue lines below.
export const RoomBreakCard = styled('section', {
  base: {
    display: 'grid',
    justifyItems: 'center',
    gap: '16px',
    width: '100%',
    maxWidth: '440px',
    padding: '24px 28px 28px',
    borderRadius: '4px',
    bg: 'stationery.card',
    bgImage: 'linear-gradient(transparent 68px, {colors.stationery.cardTop} 68px 70px, transparent 70px), repeating-linear-gradient(transparent 0 27px, rgba(202, 220, 235, 0.55) 27px 28px)',
    bgPosition: '0 0, 0 70px',
    color: 'notebook.ink',
    boxShadow: 'note',
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
  base: { fontSize: '13px', color: 'notebook.muted', textWrap: 'balance' },
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
