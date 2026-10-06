import { styled } from 'styled-system/jsx';

export const RoomRevealRoot = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    padding: '18px 12px 12px',
    lg: { height: '100%' },
  },
});

// The open book: warm paper with ruled lines, a spiral along the top, and a red margin.
export const RoomRevealBook = styled('section', {
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '720px',
    minHeight: '320px',
    paddingTop: '26px',
    borderRadius: '6px',
    color: 'notebook.ink',
    bg: 'notebook.paper',
    bgImage:
      'linear-gradient(90deg, transparent 38px, {colors.notebook.margin} 38px, {colors.notebook.margin} 40px, transparent 40px), repeating-linear-gradient(transparent 0 33px, {colors.notebook.rule} 33px 34px)',
    boxShadow: 'paper',
    animation: 'deal 0.5s cubic-bezier(0.2, 0.8, 0.3, 1.1) both',
    lg: { flex: '1', minHeight: '0' },
  },
});

// Rings punched along the top edge.
export const RoomRevealSpiral = styled('div', {
  base: {
    position: 'absolute',
    top: '-12px',
    left: '24px',
    right: '24px',
    height: '26px',
    bgImage: 'radial-gradient(circle at 50% 70%, {colors.chrome.app} 0 5px, transparent 5.5px), linear-gradient(90deg, transparent 6px, {colors.notebook.spiral} 6px 10px, transparent 10px)',
    bgSize: '28px 26px, 28px 18px',
    bgRepeat: 'repeat-x',
    bgPosition: '0 0, 0 0',
    pointerEvents: 'none',
  },
});

export const RoomRevealHeader = styled('header', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingInline: '20px',
    paddingLeft: '52px',
    paddingBottom: '12px',
    borderBottom: '2px solid',
    borderColor: 'notebook.rule',
  },
});

export const RoomRevealTitle = styled('h2', {
  base: { flex: '1', minWidth: '0', fontSize: '22px', fontWeight: '900', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomRevealCounter = styled('span', {
  base: { flexShrink: '0', fontSize: '13px', fontWeight: '700', color: 'notebook.muted' },
});

export const RoomRevealThreadRoot = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
    paddingBlock: '20px',
    paddingRight: '20px',
    paddingLeft: '52px',
    overflowY: 'auto',
    lg: { flex: '1', minHeight: '0' },
  },
});

export const RoomRevealControlsRoot = styled('div', {
  base: { display: 'grid', justifyItems: 'center', gap: '6px', width: '100%', maxWidth: '720px', textAlign: 'center' },
});

export const RoomRevealControlsButtons = styled('div', {
  base: { display: 'flex', gap: '10px', '& button': { height: '44px', paddingInline: '22px', fontSize: '16px', animation: 'nudge 1.6s ease-in-out 2s infinite' } },
});

export const RoomRevealControlsStatus = styled('p', {
  base: { fontSize: '15px', fontWeight: '700', textWrap: 'balance' },
});

export const RoomRevealControlsHint = styled('p', {
  base: { fontSize: '13px', color: 'fg.subtle', textWrap: 'balance' },
});
