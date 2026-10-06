import { styled } from 'styled-system/jsx';
import { NotebookPage } from '../../../ui';

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

// The open book, with the sheet of stickers under it, or beside it on wide screens.
export const RoomRevealDesk = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    lg: { flex: '1', minHeight: '0' },
    xl: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 720px) minmax(0, 1fr)',
      gridTemplateRows: 'minmax(0, 1fr)',
      alignItems: 'stretch',
      columnGap: '28px',
      '& > :first-child': { gridColumn: '2' },
    },
  },
});

// The open book: a notebook page, bound at the top.
export const RoomRevealBook = styled(NotebookPage, {
  base: {
    '--margin': '38px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '720px',
    minHeight: '320px',
    paddingTop: '26px',
    lg: { flex: '1', minHeight: '0' },
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
    // Stickers may hang off a page's edge, but never make the book scroll sideways.
    overflowX: 'hidden',
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

// A sheet of stickers on its backing paper: a strip under the book, or a sheet lying beside it.
export const RoomRevealStickersRoot = styled('aside', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px 10px',
    width: '100%',
    maxWidth: '720px',
    paddingBlock: '8px',
    paddingInline: '12px',
    borderRadius: '14px',
    bg: 'notebook.paperShade',
    color: 'notebook.ink',
    boxShadow: 'paper',
    xl: { display: 'grid', justifyItems: 'center', justifySelf: 'start', alignSelf: 'center', gap: '10px', width: '196px', padding: '14px', transform: 'rotate(2deg)' },
  },
});

export const RoomRevealStickersTitle = styled('h3', {
  base: { fontSize: '12px', fontWeight: '900', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'notebook.muted' },
});

export const RoomRevealStickersGrid = styled('div', {
  // Two even rows of five on a phone, one row under a wider book, three across on the sheet.
  base: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px', maxWidth: '216px', sm: { maxWidth: 'none' }, xl: { display: 'grid', gridTemplateColumns: 'repeat(3, 48px)', gap: '6px' } },
});

// A sticker on the sheet, with its white die-cut edge. Picked up, it leaves its place faded.
export const RoomRevealStickersItem = styled('button', {
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    fontFamily: 'emoji',
    fontSize: '25px',
    lineHeight: '1',
    cursor: 'grab',
    touchAction: 'none',
    userSelect: 'none',
    filter: 'drop-shadow(2px 0 0 token(colors.notebook.bubble)) drop-shadow(-2px 0 0 token(colors.notebook.bubble)) drop-shadow(0 2px 0 token(colors.notebook.bubble)) drop-shadow(0 -2px 0 token(colors.notebook.bubble)) drop-shadow(0 2px 2px rgba(38, 37, 31, 0.25))',
    transition: 'transform 0.15s ease, opacity 0.15s ease',
    _hover: { transform: 'scale(1.15) rotate(-8deg)' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    xl: { width: '48px', height: '48px', fontSize: '30px' },
  },
  variants: {
    isHeld: {
      true: { opacity: '0.3', transform: 'scale(0.9)', _hover: { transform: 'scale(0.9)' } },
      false: {},
    },
  },
});

export const RoomRevealStickersHint = styled('p', {
  base: { flexBasis: '100%', fontSize: '12px', lineHeight: '1.35', color: 'notebook.muted', textAlign: 'center', textWrap: 'balance', xl: { maxWidth: '168px' } },
});

// The sticker you're holding, lifted off the sheet and following the pointer (--ghost-x and
// --ghost-y come from useRoomRevealStickers, which also marks it while it has somewhere to be).
export const RoomRevealStickersGhost = styled('div', {
  base: {
    position: 'fixed',
    top: '0',
    left: '0',
    zIndex: '40',
    display: 'none',
    fontFamily: 'emoji',
    fontSize: '46px',
    lineHeight: '1',
    pointerEvents: 'none',
    transform: 'translate(var(--ghost-x), var(--ghost-y)) translate(-50%, -50%) rotate(-8deg) scale(1.1)',
    filter: 'drop-shadow(2px 0 0 token(colors.notebook.bubble)) drop-shadow(-2px 0 0 token(colors.notebook.bubble)) drop-shadow(0 2px 0 token(colors.notebook.bubble)) drop-shadow(0 -2px 0 token(colors.notebook.bubble)) drop-shadow(0 12px 10px rgba(0, 0, 0, 0.35))',
  },
  variants: {
    shown: {
      true: { '&[data-tracking=true]': { display: 'block' } },
      false: {},
    },
  },
});
