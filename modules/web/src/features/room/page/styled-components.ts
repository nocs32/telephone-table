import { styled } from 'styled-system/jsx';

// Pages sit on notebook paper: dark ink, the authors in their own colours.
export const PageCardRoot = styled('article', {
  base: { display: 'grid', gap: '6px', color: 'notebook.ink' },
  variants: {
    kind: {
      sentence: {},
      drawing: { paddingBlock: '4px' },
    },
    isNew: {
      true: { transformOrigin: 'top center', animation: 'pageIn 0.6s cubic-bezier(0.2, 0.7, 0.3, 1.1) both', _motionReduce: { animation: 'fadeIn 0.2s ease-out' } },
      false: {},
    },
  },
  defaultVariants: { isNew: false },
});

export const PageCardAuthor = styled('header', {
  base: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '0' },
});

export const PageCardName = styled('span', {
  base: { minWidth: '0', fontSize: '14px', fontWeight: '900', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', filter: 'brightness(0.82) saturate(1.1)' },
  variants: {
    tone: {
      raspberry: { color: 'player.raspberry' },
      sky: { color: 'player.sky' },
      green: { color: 'player.green' },
      mustard: { color: 'player.mustard', filter: 'brightness(0.7)' },
      violet: { color: 'player.violet' },
      orange: { color: 'player.orange' },
      teal: { color: 'player.teal' },
      pink: { color: 'player.pink' },
      lime: { color: 'player.lime', filter: 'brightness(0.7)' },
      indigo: { color: 'player.indigo' },
    },
  },
});

export const PageCardBody = styled('div', {
  base: { paddingLeft: '34px' },
});

// A speech bubble, pointing at its author.
export const PageCardBubble = styled('p', {
  base: {
    position: 'relative',
    display: 'inline-block',
    maxWidth: '100%',
    paddingInline: '16px',
    paddingBlock: '10px',
    borderRadius: '4px 18px 18px 18px',
    bg: 'notebook.bubble',
    boxShadow: 'sheet',
    fontSize: '20px',
    fontWeight: '700',
    lineHeight: '1.35',
    overflowWrap: 'anywhere',
    sm: { fontSize: '22px' },
  },
  variants: {
    empty: {
      true: { color: 'notebook.muted', fontStyle: 'italic', fontWeight: '400' },
      false: {},
    },
  },
  defaultVariants: { empty: false },
});

// The whole sentence keeps the bubble's size; it shows through only when there's no typing.
export const PageSentenceWhole = styled('span', {
  base: { color: 'transparent' },
});

// The sentence typing itself out over it, with a caret while it types.
export const PageSentenceTyped = styled('span', {
  base: {
    position: 'absolute',
    inset: '0',
    paddingInline: '16px',
    paddingBlock: '10px',
    '&[data-typing=true]::after': { content: '""', display: 'inline-block', width: '2px', height: '1.1em', marginLeft: '2px', verticalAlign: 'text-bottom', bg: 'currentColor', animation: 'blink 0.8s steps(1) infinite' },
  },
});

// The stickers on a page (spec D25): a layer over its drawing or bubble, catching taps only while
// you hold a sticker.
export const PageCardStickersRoot = styled('span', {
  base: { position: 'absolute', inset: '0', zIndex: '2', display: 'block', pointerEvents: 'none', fontWeight: '400', lineHeight: '1' },
  variants: {
    kind: {
      // A share of the drawing's width (the sheet is the container), as on the saved picture.
      drawing: { fontSize: 'clamp(24px, 9cqw, 50px)' },
      sentence: { fontSize: '32px' },
    },
    catching: {
      true: { pointerEvents: 'auto', cursor: 'none' },
      false: {},
    },
  },
});

// A sticker: an emoji with a white die-cut edge, slapped on at a tilt. --x, --y and --tilt come from
// usePageCardStickersItem.
export const PageCardStickersItemRoot = styled('span', {
  base: {
    position: 'absolute',
    left: 'calc(var(--x) * 100%)',
    top: 'calc(var(--y) * 100%)',
    display: 'block',
    fontFamily: 'emoji',
    transform: 'translate(-50%, -50%) rotate(var(--tilt))',
    filter: 'drop-shadow(2px 0 0 token(colors.notebook.bubble)) drop-shadow(-2px 0 0 token(colors.notebook.bubble)) drop-shadow(0 2px 0 token(colors.notebook.bubble)) drop-shadow(0 -2px 0 token(colors.notebook.bubble)) drop-shadow(0 3px 3px rgba(38, 37, 31, 0.35))',
    pointerEvents: 'auto',
    userSelect: 'none',
    animation: 'stickOn 0.4s cubic-bezier(0.3, 1.4, 0.5, 1) both',
    _motionReduce: { animation: 'fadeIn 0.2s ease-out' },
  },
});

// Your own sticker, which a tap peels off.
export const PageCardStickersItemPeel = styled('button', {
  base: {
    display: 'block',
    lineHeight: '1',
    cursor: 'pointer',
    transition: 'transform 0.12s ease',
    _hover: { transform: 'scale(1.12) rotate(-6deg)' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px', borderRadius: '6px' },
  },
});

export const PageCardFooter = styled('footer', {
  base: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingLeft: '34px', _empty: { display: 'none' } },
});

export const PageCardBadge = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    height: '24px',
    paddingInline: '10px',
    borderRadius: 'full',
    bg: 'notebook.star',
    color: 'notebook.ink',
    fontSize: '12px',
    fontWeight: '900',
    whiteSpace: 'nowrap',
    animation: 'pop 0.4s ease-out',
  },
});

export const PageCardFavourite = styled('button', {
  base: {
    height: '30px',
    paddingInline: '12px',
    borderRadius: 'full',
    border: '2px dashed',
    borderColor: 'notebook.star',
    color: 'notebook.ink',
    fontSize: '13px',
    fontWeight: '900',
    cursor: 'pointer',
    animation: 'nudge 1.4s ease-in-out infinite',
    transition: 'background-color 0.12s ease',
    _hover: { bg: 'notebook.star' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    _motionReduce: { animation: 'none' },
  },
});

export const PageHeartButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    height: '30px',
    paddingInline: '10px',
    borderRadius: 'full',
    bg: 'notebook.bubble',
    boxShadow: 'sheet',
    color: 'notebook.ink',
    fontSize: '13px',
    fontWeight: '900',
    cursor: 'pointer',
    transition: 'transform 0.12s ease',
    _hover: { transform: 'scale(1.08)' },
    _active: { transform: 'scale(0.94)' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    _disabled: { cursor: 'default', _hover: { transform: 'none' } },
  },
  variants: {
    liked: {
      true: { bg: 'notebook.heartTint' },
      false: {},
    },
  },
});

export const PageHeartIcon = styled('span', {
  base: { fontFamily: 'emoji', fontSize: '16px', lineHeight: '1' },
  variants: {
    liked: {
      true: { animation: 'pop 0.35s ease-out' },
      false: {},
    },
  },
});

export const PageHeartCount = styled('span', {
  base: { fontVariantNumeric: 'tabular-nums' },
});

// A drawing taped into the book: white paper, tape on two corners, a slight tilt.
export const PageDrawingSheet = styled('div', {
  base: {
    position: 'relative',
    width: '100%',
    maxWidth: '520px',
    padding: '8px',
    // Stickers on it size themselves by its width.
    containerType: 'inline-size',
    bg: 'notebook.bubble',
    boxShadow: 'sheet',
    _before: { content: '""', position: 'absolute', top: '-9px', left: '-14px', width: '74px', height: '22px', bg: 'notebook.tape', transform: 'rotate(-32deg)', zIndex: '1' },
    _after: { content: '""', position: 'absolute', top: '-9px', right: '-14px', width: '74px', height: '22px', bg: 'notebook.tape', transform: 'rotate(32deg)', zIndex: '1' },
  },
  variants: {
    tilt: {
      left: { transform: 'rotate(-1.2deg)' },
      right: { transform: 'rotate(1deg)' },
      none: {},
    },
    fill: {
      true: { maxWidth: 'none' },
      false: {},
    },
  },
  defaultVariants: { tilt: 'none', fill: false },
});

export const PageDrawingCanvas = styled('canvas', {
  base: { display: 'block', width: '100%', height: 'auto', aspectRatio: '4 / 3', outline: '1px solid rgba(38, 37, 31, 0.08)' },
});

export const PageDrawingSkip = styled('button', {
  base: { display: 'block', width: '100%', cursor: 'pointer', _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' } },
});
