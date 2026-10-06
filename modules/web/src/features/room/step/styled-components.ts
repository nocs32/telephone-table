import { styled } from 'styled-system/jsx';

export const RoomStepRoot = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px',
    lg: { height: '100%', paddingInline: '20px' },
  },
});

export const RoomStepHeaderRoot = styled('header', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '12px 16px',
    paddingInline: '14px',
    paddingBlock: '10px',
    borderRadius: '14px',
    border: '1px solid',
    borderColor: 'chrome.border',
    bg: 'bg.surface',
  },
});

// The step's kind, stamped onto the page as it starts.
export const RoomStepHeaderBadge = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    paddingInline: '12px',
    paddingBlock: '4px',
    borderRadius: '8px',
    border: '3px solid',
    fontSize: '15px',
    fontWeight: '900',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    transform: 'rotate(-5deg)',
    animation: 'stamp 0.55s cubic-bezier(0.2, 0.8, 0.3, 1.2) both',
    _motionReduce: { animation: 'none' },
    '& span': { fontFamily: 'emoji', letterSpacing: '0' },
  },
  variants: {
    kind: {
      write: { borderColor: 'accent.default', color: 'accent.text' },
      draw: { borderColor: 'notebook.star', color: 'notebook.star' },
    },
  },
});

export const RoomStepHeaderText = styled('div', {
  base: { display: 'grid', flex: '1', minWidth: '200px', gap: '2px' },
});

export const RoomStepHeaderTitle = styled('h2', {
  base: { fontSize: '18px', fontWeight: '900', lineHeight: '1.25', textWrap: 'balance', sm: { fontSize: '20px' } },
});

export const RoomStepHeaderMeta = styled('p', {
  base: { fontSize: '13px', fontWeight: '700', color: 'fg.subtle' },
});

export const RoomStepHeaderProgressRoot = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '10px' },
});

export const RoomStepHeaderProgressAvatars = styled('ul', {
  base: { display: 'flex', alignItems: 'center', paddingLeft: '6px' },
});

export const RoomStepHeaderProgressItem = styled('li', {
  base: { position: 'relative', display: 'inline-flex', marginLeft: '-6px', borderRadius: '8px', boxShadow: '0 0 0 2px {colors.bg.surface}', transition: 'opacity 0.2s ease' },
  variants: {
    done: {
      true: {},
      false: { opacity: '0.5' },
    },
  },
});

export const RoomStepHeaderProgressTick = styled('span', {
  base: {
    position: 'absolute',
    right: '-5px',
    bottom: '-5px',
    display: 'grid',
    placeItems: 'center',
    width: '15px',
    height: '15px',
    borderRadius: 'full',
    bg: 'success.default',
    color: 'fg.onAccent',
    boxShadow: '0 0 0 2px {colors.bg.surface}',
    animation: 'pop 0.35s ease-out',
    '& svg': { width: '10px', height: '10px', strokeWidth: '3.5' },
  },
});

export const RoomStepHeaderProgressLabel = styled('span', {
  base: { fontSize: '13px', fontWeight: '700', color: 'fg.muted', whiteSpace: 'nowrap' },
});

// A notebook page with ruled lines and a red margin.
export const RoomStepCard = styled('section', {
  base: {
    position: 'relative',
    display: 'grid',
    gap: '18px',
    width: '100%',
    maxWidth: '640px',
    marginInline: 'auto',
    paddingBlock: '24px',
    paddingRight: '24px',
    paddingLeft: '44px',
    borderRadius: '6px',
    color: 'notebook.ink',
    bg: 'notebook.paper',
    bgImage:
      'linear-gradient(90deg, transparent 30px, {colors.notebook.margin} 30px, {colors.notebook.margin} 32px, transparent 32px), repeating-linear-gradient(transparent 0 33px, {colors.notebook.rule} 33px 34px)',
    boxShadow: 'paper',
    animation: 'deal 0.45s cubic-bezier(0.2, 0.8, 0.3, 1.1) both',
    _motionReduce: { animation: 'none' },
  },
});

export const RoomStepWritePromptRoot = styled('div', {
  base: { display: 'grid', justifyItems: 'center', paddingTop: '8px' },
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
  base: { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '12px' },
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

export const RoomStepDrawRoot = styled('section', {
  base: { display: 'flex', flexDirection: 'column', gap: '12px', animation: 'deal 0.45s cubic-bezier(0.2, 0.8, 0.3, 1.1) both', lg: { flex: '1', minHeight: '0' } },
});

// The sentence to draw, on a strip of paper above the board.
export const RoomStepDrawSentence = styled('p', {
  base: {
    alignSelf: 'center',
    display: 'grid',
    gap: '2px',
    maxWidth: '760px',
    paddingInline: '20px',
    paddingBlock: '10px',
    borderRadius: '4px',
    bg: 'notebook.paper',
    color: 'notebook.ink',
    boxShadow: 'paper',
    fontSize: '20px',
    fontWeight: '900',
    lineHeight: '1.3',
    textAlign: 'center',
    textWrap: 'balance',
    transform: 'rotate(-0.6deg)',
    sm: { fontSize: '24px' },
  },
  variants: {
    empty: {
      true: { fontSize: '17px', fontWeight: '700', color: 'notebook.muted', sm: { fontSize: '18px' } },
      false: {},
    },
  },
});

export const RoomStepDrawLabel = styled('span', {
  base: { fontSize: '11px', fontWeight: '900', color: 'notebook.muted', letterSpacing: '0.1em', textTransform: 'uppercase' },
});

// On desktop the board fits the space both ways.
export const RoomStepDrawArea = styled('div', {
  base: { position: 'relative', display: 'grid', placeItems: 'center', lg: { flex: '1', minHeight: '0', containerType: 'size' } },
});

export const RoomStepDrawBar = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px 18px',
    paddingInline: '12px',
    paddingBlock: '8px',
    borderRadius: '14px',
    border: '1px solid',
    borderColor: 'chrome.border',
    bg: 'bg.surface',
  },
});

// Over your page once you've pressed Done.
export const RoomStepWaitingRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '2', display: 'grid', placeItems: 'center', padding: '12px', borderRadius: '8px', bg: 'rgba(17, 17, 16, 0.58)', animation: 'fadeIn 0.2s ease-out' },
});

export const RoomStepWaitingCard = styled('div', {
  base: {
    display: 'grid',
    justifyItems: 'center',
    gap: '8px',
    maxWidth: '320px',
    paddingInline: '22px',
    paddingBlock: '18px',
    borderRadius: '14px',
    bg: 'bg.surface',
    color: 'fg.default',
    boxShadow: 'dialog',
    textAlign: 'center',
    animation: 'dialogIn 0.25s ease-out',
  },
});

export const RoomStepWaitingTitle = styled('p', {
  base: { fontSize: '20px', fontWeight: '900' },
});

export const RoomStepWaitingText = styled('p', {
  base: { fontSize: '14px', color: 'fg.muted' },
});

export const RoomStepWatchingRoot = styled('section', {
  base: {
    display: 'grid',
    justifyItems: 'center',
    alignContent: 'center',
    gap: '10px',
    maxWidth: '440px',
    marginInline: 'auto',
    marginTop: '24px',
    padding: '28px',
    borderRadius: '16px',
    bg: 'bg.surface',
    textAlign: 'center',
    animation: 'deal 0.45s ease-out',
  },
});

export const RoomStepWatchingEmoji = styled('span', {
  base: { fontFamily: 'emoji', fontSize: '44px', lineHeight: '1' },
});

export const RoomStepWatchingText = styled('p', {
  base: { fontSize: '16px', fontWeight: '700', color: 'fg.muted', textWrap: 'balance' },
});
