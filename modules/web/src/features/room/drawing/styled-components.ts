import { styled } from 'styled-system/jsx';

// The board fits its container both ways when the container is a size container (desktop); on a
// phone it fills the width.
export const DrawingBoardRoot = styled('div', {
  base: { position: 'relative', width: '100%', lg: { width: 'min(100cqw, calc(100cqh * 4 / 3))' } },
  variants: {
    // Taped into a notebook, as drawings are at the reveal (spec D15).
    taped: {
      true: {
        _before: { content: '""', position: 'absolute', top: '-16px', left: '-22px', zIndex: '1', width: '84px', height: '24px', bg: 'notebook.tape', transform: 'rotate(-32deg)', pointerEvents: 'none' },
        _after: { content: '""', position: 'absolute', top: '-16px', right: '-22px', zIndex: '1', width: '84px', height: '24px', bg: 'notebook.tape', transform: 'rotate(32deg)', pointerEvents: 'none' },
      },
      false: {},
    },
  },
  defaultVariants: { taped: false },
});

// 4:3 white paper.
export const DrawingBoardPaper = styled('div', {
  base: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4 / 3',
    borderRadius: '10px',
    overflow: 'hidden',
    bg: 'board.paper',
    boxShadow: '0 0 0 1px {colors.board.edge}, 0 14px 34px rgba(0, 0, 0, 0.45)',
  },
  variants: {
    taped: {
      true: { borderRadius: '1px', boxShadow: '0 0 0 1px rgba(38, 37, 31, 0.08), 0 0 0 7px {colors.ink.white}, 0 10px 22px rgba(38, 37, 31, 0.28)' },
      false: {},
    },
  },
  defaultVariants: { taped: false },
});

export const DrawingBoardCanvas = styled('canvas', {
  base: { display: 'block', width: '100%', height: '100%', touchAction: 'none', userSelect: 'none' },
  variants: {
    cursor: {
      none: { cursor: 'default' },
      brush: { cursor: 'crosshair' },
      fill: { cursor: 'cell' },
    },
  },
  defaultVariants: { cursor: 'none' },
});

export const DrawingToolsRoot = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '6px 14px' },
});

export const DrawingToolsGroup = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '2px' },
});

export const DrawingToolsButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    color: 'fg.muted',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease',
    _hover: { bg: 'bg.hover', color: 'fg.default' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    _disabled: { opacity: '0.4', cursor: 'not-allowed', _hover: { bg: 'transparent', color: 'fg.muted' } },
    '&[aria-pressed=true], &[data-state=open]': { bg: 'accent.tint', color: 'accent.text' },
    '& svg': { width: '20px', height: '20px' },
  },
});

export const DrawingToolsDot = styled('span', {
  base: { display: 'block', borderRadius: 'full', bg: 'currentColor' },
  variants: {
    dot: {
      xs: { width: '4px', height: '4px' },
      sm: { width: '8px', height: '8px' },
      md: { width: '14px', height: '14px' },
      lg: { width: '22px', height: '22px' },
    },
  },
});

export const DrawingToolsSwatches = styled('div', {
  base: { display: 'grid', gridTemplateColumns: 'repeat(8, 22px)', gap: '4px' },
});

export const DrawingToolsSwatch = styled('button', {
  base: {
    width: '22px',
    height: '22px',
    borderRadius: '6px',
    boxShadow: 'inset 0 0 0 1px {colors.border.default}',
    cursor: 'pointer',
    transition: 'transform 0.1s ease',
    _hover: { transform: 'scale(1.12)' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
  variants: {
    ink: {
      black: { bg: 'ink.black' },
      charcoal: { bg: 'ink.charcoal' },
      gray: { bg: 'ink.gray' },
      silver: { bg: 'ink.silver' },
      white: { bg: 'ink.white' },
      red: { bg: 'ink.red' },
      orange: { bg: 'ink.orange' },
      yellow: { bg: 'ink.yellow' },
      lime: { bg: 'ink.lime' },
      green: { bg: 'ink.green' },
      teal: { bg: 'ink.teal' },
      sky: { bg: 'ink.sky' },
      blue: { bg: 'ink.blue' },
      violet: { bg: 'ink.violet' },
      pink: { bg: 'ink.pink' },
      brown: { bg: 'ink.brown' },
    },
    selected: {
      true: { outline: '2px solid', outlineColor: 'fg.default', outlineOffset: '2px' },
      false: {},
    },
  },
  defaultVariants: { selected: false },
});
