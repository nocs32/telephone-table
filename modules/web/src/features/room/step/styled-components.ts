import { styled } from 'styled-system/jsx';
import { NotebookPage } from '../../../ui';

export const RoomStepRoot = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '14px', padding: '12px', lg: { height: '100%', paddingInline: '20px' } },
});

export const RoomStepHeaderRoot = styled('header', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gridTemplateAreas: '"badge clock" "text text"',
    alignItems: 'center',
    gap: '10px 18px',
    paddingInline: '6px',
    paddingTop: '6px',
    '& > [role=timer]': { gridArea: 'clock' },
    sm: { gridTemplateColumns: 'auto minmax(0, 1fr) auto', gridTemplateAreas: '"badge text clock"' },
  },
});

// The step's kind, stamped on a kraft label as the step starts.
export const RoomStepHeaderLabel = styled('span', {
  base: { gridArea: 'badge', justifySelf: 'start', display: 'inline-flex', paddingInline: '10px', paddingBlock: '8px', borderRadius: '3px', bg: 'stationery.kraft', bgImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), transparent 60%)', boxShadow: 'note', transform: 'rotate(-3deg)', animation: 'deal 0.4s ease-out', _motionReduce: { animation: 'none' } },
});

// Ink worn in patches, like a real rubber stamp's.
export const RoomStepHeaderBadge = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    paddingInline: '10px',
    paddingBlock: '2px',
    borderRadius: '6px',
    border: '3px solid',
    fontSize: '18px',
    fontWeight: '900',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' seed='4'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -3.2 0 0 0 2.5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    transform: 'rotate(-5deg)',
    animation: 'stamp 0.55s cubic-bezier(0.2, 0.8, 0.3, 1.2) 0.35s both',
    _motionReduce: { animation: 'none' },
    '& svg': { width: '18px', height: '18px', strokeWidth: '2.75' },
  },
  variants: {
    kind: {
      write: { color: 'stationery.stampBlue' },
      draw: { color: 'stationery.stamp' },
    },
  },
});

export const RoomStepHeaderText = styled('div', {
  base: { gridArea: 'text', display: 'grid', minWidth: '0', gap: '0' },
});

// Chalky handwriting on the mat.
export const RoomStepHeaderTitle = styled('h2', {
  base: { fontSize: '20px', fontWeight: '900', lineHeight: '1.2', color: 'desk.chalk', textWrap: 'balance', sm: { fontSize: '24px' } },
});

export const RoomStepHeaderMeta = styled('p', {
  base: { fontSize: '13px', fontWeight: '700', color: 'desk.chalkMuted' },
});

// The page you work on, and who's done beside it (on a phone: a strip above it).
export const RoomStepBody = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    lg: { flex: '1', minHeight: '0', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 240px', alignItems: 'stretch', gap: '18px' },
  },
});

export const RoomStepMain = styled('div', {
  base: { display: 'flex', flexDirection: 'column', minWidth: '0', paddingTop: '12px', lg: { minHeight: '0' } },
});

// Who's done, by name: a sticky note beside the page (on a phone, a strip of names on one).
export const RoomStepPeopleRoot = styled('aside', {
  base: {
    '--tilt': '0.6deg',
    order: '-1',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    alignContent: 'start',
    gap: '6px',
    paddingInline: '12px',
    paddingBlock: '10px',
    borderRadius: '2px',
    bg: 'stationery.sticky',
    bgImage: 'linear-gradient(to bottom, rgba(120, 90, 0, 0.09), transparent 26px)',
    color: 'notebook.ink',
    boxShadow: 'note',
    transform: 'rotate(var(--tilt))',
    animation: 'noteIn 0.45s ease-out 0.2s both',
    _motionReduce: { animation: 'none' },
    lg: { '--tilt': '1.6deg', order: '0', alignSelf: 'start', maxHeight: '100%', marginTop: '18px', overflowX: 'hidden', overflowY: 'auto', paddingInline: '16px', paddingTop: '14px', paddingBottom: '18px' },
  },
});

export const RoomStepPeopleHead = styled('header', {
  base: { display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '2px 8px', minWidth: '0' },
});

export const RoomStepPeopleTitle = styled('h3', {
  base: { fontSize: '15px', fontWeight: '900' },
});

export const RoomStepPeopleCount = styled('span', {
  base: { fontSize: '12px', fontWeight: '700', color: 'notebook.muted', whiteSpace: 'nowrap' },
});

export const RoomStepPeopleList = styled('ul', {
  base: { display: 'flex', flexWrap: 'wrap', gap: '4px 12px', minWidth: '0', lg: { flexDirection: 'column', flexWrap: 'nowrap', gap: '2px' } },
});

export const RoomStepPeopleItem = styled('li', {
  base: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '0', height: '32px', lg: { height: '38px' } },
  variants: {
    status: {
      done: {},
      working: {},
      away: { opacity: '0.55' },
    },
  },
});

export const RoomStepPeopleName = styled('span', {
  base: { flex: '1', minWidth: '0', maxWidth: '120px', fontSize: '14px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lg: { maxWidth: 'none' } },
});

// On a phone only the tick shows; on desktop, a hand-drawn tick and "done", or a busy pencil.
export const RoomStepPeopleStatus = styled('span', {
  base: { display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: '0', fontSize: '12px', fontWeight: '900', '& svg': { width: '16px', height: '16px', strokeWidth: '3.5' } },
  variants: {
    status: {
      done: { color: 'stationery.stampGreen', fontSize: '0', animation: 'pop 0.35s ease-out', lg: { fontSize: '12px' } },
      working: { display: 'none', color: 'notebook.muted', lg: { display: 'inline-flex' } },
      away: { display: 'none', color: 'notebook.muted', lg: { display: 'inline-flex' } },
    },
  },
});

// The pencil of someone still at it.
export const RoomStepPeoplePencil = styled('span', {
  base: { display: 'inline-block', fontFamily: 'emoji', fontSize: '15px', animation: 'scribble 0.9s ease-in-out infinite', _motionReduce: { animation: 'none' } },
});

// Every step's page of the notebook: the same frame for writing and drawing, so it never jumps in
// size between steps. On desktop it fills the space beside the who's-done card.
export const RoomStepPage = styled(NotebookPage, {
  base: {
    '--margin': '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    maxWidth: '1100px',
    minHeight: '440px',
    marginInline: 'auto',
    paddingTop: '26px',
    paddingBottom: '16px',
    paddingRight: '16px',
    paddingLeft: '32px',
    sm: { '--margin': '30px', paddingLeft: '48px', paddingRight: '28px' },
    lg: { flex: '1', minHeight: '0' },
    // The pass: the book slides over from your neighbour, then turns to a fresh page.
    '--turn-delay': '0.6s',
    animation: 'passIn 0.7s cubic-bezier(0.2, 0.75, 0.3, 1)',
    _motionReduce: { animation: 'none' },
  },
});

// The top: what to draw, written on the page's first lines.
export const RoomStepPageHead = styled('p', {
  base: { display: 'grid', gap: '2px', fontSize: '20px', fontWeight: '900', lineHeight: '1.3', textWrap: 'balance', sm: { fontSize: '24px' } },
  variants: {
    empty: {
      true: { fontSize: '17px', fontWeight: '700', color: 'notebook.muted', sm: { fontSize: '18px' } },
      false: {},
    },
  },
});

export const RoomStepPageLabel = styled('span', {
  base: { fontSize: '11px', fontWeight: '900', color: 'notebook.muted', letterSpacing: '0.1em', textTransform: 'uppercase' },
});

// The middle: the board, the drawing to describe, or the 🎲. On desktop it fits the space both ways.
export const RoomStepPageBody = styled('div', {
  base: { position: 'relative', flex: '1', display: 'grid', placeItems: 'center', minHeight: '0', padding: '22px 10px 10px', lg: { containerType: 'size' } },
});

// A drawing to describe, as big as the page allows (its sheet adds 16px around the 4:3 picture).
export const RoomStepPageFit = styled('div', {
  base: { width: '100%', lg: { width: 'min(100cqw, calc((100cqh - 16px) * 4 / 3 + 16px))' } },
});

// The bottom: your tools and Done, on a little tray on the paper.
export const RoomStepPageFoot = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '10px 14px' },
});

export const RoomStepTray = styled('div', {
  base: { paddingInline: '10px', paddingBlock: '6px', borderRadius: '14px', bg: 'bg.surface', color: 'fg.default', boxShadow: 'floating' },
});

export const RoomStepWritePromptRoot = styled('div', {
  base: { display: 'grid', justifyItems: 'center', width: '100%' },
});

export const RoomStepWriteIdea = styled('div', {
  base: { display: 'grid', justifyItems: 'center', gap: '6px', textAlign: 'center' },
});

export const RoomStepWriteDice = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    height: '40px',
    paddingInline: '16px',
    borderRadius: 'full',
    border: '2px dashed',
    borderColor: 'notebook.spiral',
    bg: 'notebook.bubble',
    color: 'notebook.ink',
    fontSize: '15px',
    fontWeight: '900',
    cursor: 'pointer',
    _hover: { borderColor: 'accent.default', '& span': { animation: 'roll 0.5s ease-out' } },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
    '& span': { display: 'inline-block', fontFamily: 'emoji', fontSize: '20px' },
  },
});

export const RoomStepWriteIdeaHint = styled('p', {
  base: { fontSize: '13px', color: 'notebook.muted' },
});

export const RoomStepWriteBlank = styled('p', {
  base: { paddingBlock: '28px', paddingInline: '16px', border: '2px dashed', borderColor: 'notebook.spiral', borderRadius: '8px', fontSize: '15px', fontWeight: '700', color: 'notebook.muted', textAlign: 'center' },
});

export const RoomStepWriteForm = styled('form', {
  base: { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '12px', width: '100%', maxWidth: '760px', marginInline: 'auto' },
});

export const RoomStepWriteField = styled('label', {
  base: { display: 'grid', flex: '1', minWidth: '220px', gap: '2px' },
});

export const RoomStepWriteInput = styled('input', {
  base: {
    width: '100%',
    height: '48px',
    paddingInline: '4px',
    bg: 'transparent',
    borderBottom: '3px solid',
    borderColor: 'notebook.ink',
    color: 'notebook.ink',
    fontSize: '22px',
    fontWeight: '700',
    outline: 'none',
    _placeholder: { color: 'notebook.muted', fontWeight: '400' },
    _focus: { borderColor: 'accent.default' },
    _disabled: { opacity: '0.6' },
  },
});

export const RoomStepWriteCounter = styled('span', {
  base: { justifySelf: 'end', fontSize: '12px', color: 'notebook.muted', fontVariantNumeric: 'tabular-nums' },
});

// Over your page once you've pressed Done: the page is stamped, with a note on it.
export const RoomStepWaitingRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '2', display: 'grid', placeItems: 'center', alignContent: 'center', gap: '18px', padding: '12px', borderRadius: '6px', bg: 'rgba(251, 248, 241, 0.4)', animation: 'fadeIn 0.2s ease-out' },
});

export const RoomStepWaitingStamp = styled('p', {
  base: {
    paddingInline: '22px',
    paddingBlock: '2px',
    borderRadius: '12px',
    border: '6px solid',
    color: 'stationery.stamp',
    fontSize: '64px',
    fontWeight: '900',
    lineHeight: '1.1',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    opacity: '0.88',
    maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='2' seed='9'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -3.2 0 0 0 2.5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    transform: 'rotate(-12deg)',
    animation: 'stampDown 0.5s cubic-bezier(0.3, 0.7, 0.3, 1.1) both',
    _motionReduce: { animation: 'none' },
    sm: { fontSize: '84px' },
  },
});

export const RoomStepWaitingNote = styled('div', {
  base: {
    '--tilt': '2deg',
    display: 'grid',
    justifyItems: 'center',
    gap: '8px',
    maxWidth: '260px',
    paddingInline: '20px',
    paddingBlock: '14px',
    borderRadius: '2px',
    bg: 'stationery.sticky',
    bgImage: 'linear-gradient(to bottom, rgba(120, 90, 0, 0.09), transparent 22px)',
    color: 'notebook.ink',
    boxShadow: 'note',
    textAlign: 'center',
    transform: 'rotate(var(--tilt))',
    animation: 'noteIn 0.4s ease-out 0.35s both',
    _motionReduce: { animation: 'none' },
  },
});

export const RoomStepWaitingText = styled('p', {
  base: { fontSize: '16px', fontWeight: '900' },
});

export const RoomStepWatchingRoot = styled('section', {
  base: { display: 'grid', justifyItems: 'center', alignContent: 'center', gap: '10px', width: '100%', maxWidth: '440px', marginInline: 'auto', padding: '28px', borderRadius: '16px', bg: 'bg.surface', textAlign: 'center', animation: 'deal 0.45s ease-out' },
});

export const RoomStepWatchingEmoji = styled('span', {
  base: { fontFamily: 'emoji', fontSize: '44px', lineHeight: '1' },
});

export const RoomStepWatchingText = styled('p', {
  base: { fontSize: '16px', fontWeight: '700', color: 'fg.muted', textWrap: 'balance' },
});
