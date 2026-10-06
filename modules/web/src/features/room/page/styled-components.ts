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
