import { styled } from 'styled-system/jsx';

// A notebook page (spec D15): warm paper with ruled lines, and a red margin `--margin` from the left.
export const NotebookPage = styled('section', {
  base: {
    '--margin': '32px',
    position: 'relative',
    borderRadius: '6px',
    color: 'notebook.ink',
    bg: 'notebook.paper',
    bgImage:
      'linear-gradient(90deg, transparent var(--margin), {colors.notebook.margin} var(--margin), {colors.notebook.margin} calc(var(--margin) + 2px), transparent calc(var(--margin) + 2px)), repeating-linear-gradient(transparent 0 33px, {colors.notebook.rule} 33px 34px)',
    boxShadow: 'paper',
  },
});

// Rings punched along the top edge: the notebook is bound at the top, like a reporter's pad. Each
// 28px tile is a hole with its wire dropping into the middle of it (both centred at 14px), and the
// tiles are spaced out to fill the edge with whole rings, so none is cut off at the end.
export const NotebookSpiral = styled('div', {
  base: {
    position: 'absolute',
    top: '-12px',
    left: '24px',
    right: '24px',
    zIndex: '5',
    height: '26px',
    bgImage: 'radial-gradient(circle at 50% 70%, {colors.chrome.app} 0 5px, transparent 5.5px), linear-gradient(90deg, transparent 12px, {colors.notebook.spiral} 12px 16px, transparent 16px)',
    bgSize: '28px 26px, 28px 18px',
    bgRepeat: 'space no-repeat',
    pointerEvents: 'none',
  },
});

// The page before this one turning over the binding, in 3D (see NotebookTurn).
export const NotebookTurnRoot = styled('div', {
  base: {
    position: 'absolute',
    inset: '0',
    zIndex: '4',
    borderRadius: 'inherit',
    perspective: '3200px',
    perspectiveOrigin: '50% 0%',
    // Nothing shows above the binding: the turning page slides behind the rings, like a flip
    // calendar's. It may spread a little past the sides and bottom as it lifts towards you.
    clipPath: 'inset(0 -6% -30% -6%)',
    pointerEvents: 'none',
    _motionReduce: { display: 'none' },
  },
});

// The lifting page's shadow on the new page: deep at first, shrinking towards the binding.
export const NotebookTurnShadow = styled('div', {
  base: {
    position: 'absolute',
    inset: '0',
    borderRadius: 'inherit',
    bgImage: 'linear-gradient(to bottom, rgba(38, 37, 31, 0.34), rgba(38, 37, 31, 0.14) 45%, transparent 80%)',
    transformOrigin: 'top center',
    animation: 'pageTurnShadow 0.9s ease-out forwards',
  },
});

// The whole sheet, hinged at the binding: it swings up until it's edge-on under the rings.
export const NotebookTurnSheet = styled('div', {
  base: {
    position: 'absolute',
    inset: '0',
    transformOrigin: 'top center',
    transformStyle: 'preserve-3d',
    animation: 'pageTurn 0.9s cubic-bezier(0.45, 0, 0.35, 1) forwards',
  },
});

// Each half of the sheet. The bottom half bends on its own hinge, so the page curls as it lifts.
export const NotebookTurnHalf = styled('div', {
  base: { position: 'absolute', left: '0', right: '0', height: '50%', transformStyle: 'preserve-3d' },
  variants: {
    part: {
      top: { top: '0' },
      bottom: { top: '50%', transformOrigin: 'top center', animation: 'pageCurl 0.9s ease-in-out forwards' },
    },
  },
});

// The printed side, darkening towards the lifting edge as it curls away from the light.
export const NotebookTurnFront = styled('div', {
  base: {
    position: 'absolute',
    inset: '0',
    bg: 'notebook.paper',
    bgImage: 'repeating-linear-gradient(transparent 0 33px, {colors.notebook.rule} 33px 34px)',
    backfaceVisibility: 'hidden',
    _after: { content: '""', position: 'absolute', inset: '0', borderRadius: 'inherit', animation: 'pageTurnShade 0.9s ease-in forwards' },
  },
  variants: {
    part: {
      top: { borderTopRadius: '6px', _after: { bgImage: 'linear-gradient(to bottom, transparent 30%, rgba(38, 37, 31, 0.1))' } },
      bottom: { borderBottomRadius: '6px', _after: { bgImage: 'linear-gradient(to bottom, rgba(38, 37, 31, 0.1), rgba(38, 37, 31, 0.32))' } },
    },
  },
});

// The back of the sheet, seen once it's past halfway: plain, a shade darker, shadowed at the binding.
export const NotebookTurnBack = styled('div', {
  base: { position: 'absolute', inset: '0', bg: 'notebook.paperShade', transform: 'rotateX(180deg)', backfaceVisibility: 'hidden' },
  variants: {
    part: {
      top: { borderTopRadius: '6px', bgImage: 'linear-gradient(to bottom, rgba(38, 37, 31, 0.3), transparent 60%)' },
      bottom: { borderBottomRadius: '6px', bgImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.12), rgba(38, 37, 31, 0.12))' },
    },
  },
});
