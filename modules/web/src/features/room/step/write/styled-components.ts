import { styled } from 'styled-system/jsx';

export const RoomStepWritePromptRoot = styled('div', {
  base: { display: 'grid', justifyItems: 'center', width: '100%' },
});

export const RoomStepWriteIdea = styled('div', {
  base: { display: 'grid', justifyItems: 'center', gap: '6px', textAlign: 'center' },
});

// Give me an idea: the same die as on the doodle board, which rolls when you go for it.
export const RoomStepWriteDice = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    paddingBlock: '5px',
    paddingLeft: '6px',
    paddingRight: '10px',
    borderRadius: '10px',
    color: 'notebook.ink',
    fontSize: '15px',
    fontWeight: '900',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease',
    _hover: { bg: 'rgba(38, 37, 31, 0.07)', '& > span': { animation: 'dieRoll 0.65s cubic-bezier(0.3, 0.7, 0.4, 1)' } },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
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
  variants: {
    big: {
      true: { gap: '16px', justifyContent: 'center' },
      false: {},
    },
  },
  defaultVariants: { big: false },
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
  variants: {
    // Page one: your sentence written large, in the middle of the page.
    big: {
      true: { height: '60px', fontSize: '19px', textAlign: 'center', sm: { height: '64px', fontSize: '30px' } },
      false: {},
    },
  },
  defaultVariants: { big: false },
});

export const RoomStepWriteCounter = styled('span', {
  base: { justifySelf: 'end', fontSize: '12px', color: 'notebook.muted', fontVariantNumeric: 'tabular-nums' },
});

// Page one: whose book it is at the top, your sentence in the middle, and how it goes on.
export const RoomStepWriteFirstRoot = styled('div', {
  base: { flex: '1', display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: '18px', minHeight: '0', paddingTop: '14px' },
});

// A bookplate, stamped in blue ink, with your name on its line.
export const RoomStepWriteBookplate = styled('div', {
  base: { justifySelf: 'start', display: 'grid', gap: '2px', minWidth: '220px', maxWidth: '100%', paddingInline: '18px', paddingBlock: '10px', border: '4px double', borderColor: 'stationery.stampBlue', borderRadius: '12px', color: 'stationery.stampBlue', transform: 'rotate(-1.5deg)' },
});

export const RoomStepWriteBookplateLabel = styled('span', {
  base: { fontSize: '11px', fontWeight: '900', letterSpacing: '0.16em', textTransform: 'uppercase' },
});

export const RoomStepWriteBookplateName = styled('span', {
  base: { paddingBottom: '2px', borderBottom: '2px solid', borderColor: 'rgba(63, 95, 217, 0.35)', color: 'notebook.ink', fontSize: '22px', fontWeight: '900', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomStepWriteFirstMiddle = styled('div', {
  base: { alignSelf: 'center', display: 'grid', justifyItems: 'center', gap: '20px', width: '100%', maxWidth: '760px', marginInline: 'auto' },
});

// How the game goes on from here, on a sticky note (spec D23): for whoever's new to telephone.
export const RoomStepWriteHow = styled('aside', {
  base: {
    '--tilt': '2.5deg',
    justifySelf: 'center',
    maxWidth: '320px',
    paddingInline: '16px',
    paddingTop: '12px',
    paddingBottom: '14px',
    bg: 'stationery.sticky',
    bgImage: 'linear-gradient(to bottom, rgba(120, 90, 0, 0.09), transparent 22px)',
    color: 'notebook.ink',
    boxShadow: 'note',
    transform: 'rotate(var(--tilt))',
    animation: 'noteIn 0.45s ease-out 1s both',
    _motionReduce: { animation: 'none' },
    xl: { position: 'absolute', top: '46px', right: '28px', width: '250px' },
  },
});

export const RoomStepWriteHowTitle = styled('h3', {
  base: { marginBottom: '6px', fontSize: '15px', fontWeight: '900' },
});

export const RoomStepWriteHowList = styled('ol', {
  base: { display: 'grid', gap: '5px', paddingLeft: '18px', listStyleType: 'decimal', fontSize: '13px', fontWeight: '700', lineHeight: '1.35' },
});

export const RoomStepWriteHowItem = styled('li', {
  base: { paddingLeft: '2px' },
});
