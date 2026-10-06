import { Dialog } from '@ark-ui/react/dialog';
import { styled } from 'styled-system/jsx';

export const RoomShelfRoot = styled('div', {
  base: { display: 'grid', alignContent: 'start', gap: '22px', width: '100%', maxWidth: '1080px', marginInline: 'auto', padding: '20px 14px' },
});

export const RoomShelfHeader = styled('header', {
  base: { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' },
});

export const RoomShelfTitle = styled('h2', {
  base: { fontSize: '28px', fontWeight: '900', letterSpacing: '-0.02em' },
});

export const RoomShelfSubtitle = styled('p', {
  base: { fontSize: '14px', color: 'fg.muted' },
});

export const RoomShelfActions = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
});

export const RoomShelfRound = styled('section', {
  base: { display: 'grid', gap: '12px' },
});

export const RoomShelfRoundTitle = styled('h3', {
  base: { fontSize: '13px', fontWeight: '900', color: 'fg.subtle', letterSpacing: '0.1em', textTransform: 'uppercase' },
});

export const RoomShelfGrid = styled('div', {
  base: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' },
});

// A notebook's cover, with its owner's colour on the spine.
export const RoomShelfCoverRoot = styled('article', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '6px 12px 12px 6px',
    borderLeft: '12px solid',
    bg: 'notebook.paper',
    color: 'notebook.ink',
    boxShadow: 'paper',
    overflow: 'hidden',
    transition: 'transform 0.15s ease',
    animation: 'deal 0.4s ease-out both',
    _hover: { transform: 'translateY(-3px) rotate(-0.6deg)' },
  },
  variants: {
    spine: {
      raspberry: { borderColor: 'player.raspberry' },
      sky: { borderColor: 'player.sky' },
      green: { borderColor: 'player.green' },
      mustard: { borderColor: 'player.mustard' },
      violet: { borderColor: 'player.violet' },
      orange: { borderColor: 'player.orange' },
      teal: { borderColor: 'player.teal' },
      pink: { borderColor: 'player.pink' },
      lime: { borderColor: 'player.lime' },
      indigo: { borderColor: 'player.indigo' },
    },
  },
});

export const RoomShelfCoverOpen = styled('button', {
  base: {
    display: 'grid',
    alignContent: 'start',
    gap: '10px',
    flex: '1',
    minHeight: '150px',
    padding: '14px',
    textAlign: 'left',
    cursor: 'pointer',
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '-3px' },
  },
});

export const RoomShelfCoverOwner = styled('span', {
  base: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '0' },
});

export const RoomShelfCoverTitle = styled('span', {
  base: { fontSize: '13px', fontWeight: '900', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomShelfCoverText = styled('span', {
  base: { fontSize: '17px', fontWeight: '700', lineHeight: '1.3', overflowWrap: 'anywhere', _before: { content: '"“"' }, _after: { content: '"”"' } },
});

export const RoomShelfCoverPages = styled('span', {
  base: { marginTop: 'auto', fontSize: '12px', color: 'notebook.muted' },
});

export const RoomShelfCoverSave = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    height: '36px',
    borderTop: '1px solid',
    borderColor: 'notebook.rule',
    fontSize: '13px',
    fontWeight: '900',
    color: 'notebook.ink',
    cursor: 'pointer',
    _hover: { bg: 'notebook.paperShade' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '-3px' },
    '& svg': { width: '15px', height: '15px' },
  },
});

export const RoomShelfBookBackdrop = styled(Dialog.Backdrop, {
  base: { position: 'fixed', inset: '0', zIndex: '40', bg: 'bg.overlay', animation: 'fadeIn 0.15s ease-out' },
});

export const RoomShelfBookPositioner = styled(Dialog.Positioner, {
  base: { position: 'fixed', inset: '0', zIndex: '41', display: 'grid', placeItems: 'center', padding: '16px' },
});

export const RoomShelfBookContent = styled(Dialog.Content, {
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '680px',
    maxHeight: 'calc(100dvh - 32px)',
    borderRadius: '8px',
    bg: 'notebook.paper',
    bgImage: 'repeating-linear-gradient(transparent 0 33px, {colors.notebook.rule} 33px 34px)',
    color: 'notebook.ink',
    boxShadow: 'dialog',
    outline: 'none',
    animation: 'dialogIn 0.2s ease-out',
  },
});

export const RoomShelfBookHeader = styled('header', {
  base: { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 14px 12px 20px', borderBottom: '2px solid', borderColor: 'notebook.rule', bg: 'notebook.paper', '& [data-scope=dialog] svg, & button:last-child': { color: 'notebook.ink' } },
});

export const RoomShelfBookTitle = styled('h2', {
  base: { flex: '1', minWidth: '0', fontSize: '20px', fontWeight: '900', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomShelfBookPages = styled('div', {
  base: { display: 'flex', flexDirection: 'column', gap: '22px', padding: '22px 20px', overflowY: 'auto' },
});

// Over the shelf, with confetti falling.
export const RoomShelfPodiumRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '8', display: 'grid', placeItems: 'start center', overflowY: 'auto', overflowX: 'hidden', padding: '20px 14px', bg: 'bg.overlay', animation: 'fadeIn 0.25s ease-out' },
});

export const RoomShelfPodiumConfetti = styled('span', {
  base: {
    position: 'fixed',
    top: '0',
    width: '10px',
    height: '16px',
    borderRadius: '2px',
    pointerEvents: 'none',
    animation: 'confetti 3.6s linear infinite',
    _motionReduce: { display: 'none' },
  },
  variants: {
    lane: {
      c1: { left: '4%', '--drift': '30px' },
      c2: { left: '12%', '--drift': '-40px' },
      c3: { left: '20%', '--drift': '60px' },
      c4: { left: '28%', '--drift': '-20px' },
      c5: { left: '36%', '--drift': '45px' },
      c6: { left: '44%', '--drift': '-55px' },
      c7: { left: '52%', '--drift': '25px' },
      c8: { left: '60%', '--drift': '-35px' },
      c9: { left: '68%', '--drift': '50px' },
      c10: { left: '76%', '--drift': '-45px' },
      c11: { left: '84%', '--drift': '35px' },
      c12: { left: '92%', '--drift': '-25px' },
    },
    delay: {
      d1: { animationDelay: '0s' },
      d2: { animationDelay: '0.9s' },
      d3: { animationDelay: '1.8s' },
      d4: { animationDelay: '2.7s' },
    },
    ink: {
      red: { bg: 'ink.red' },
      yellow: { bg: 'ink.yellow' },
      sky: { bg: 'ink.sky' },
      green: { bg: 'ink.green' },
      pink: { bg: 'ink.pink' },
      violet: { bg: 'ink.violet' },
    },
  },
});

export const RoomShelfPodiumCard = styled('section', {
  base: {
    position: 'relative',
    display: 'grid',
    justifyItems: 'center',
    gap: '14px',
    width: '100%',
    maxWidth: '560px',
    marginBlock: 'auto',
    padding: '24px',
    borderRadius: '16px',
    bg: 'bg.surface',
    boxShadow: 'dialog',
    textAlign: 'center',
    animation: 'dialogIn 0.3s ease-out',
  },
});

export const RoomShelfPodiumCrown = styled('span', {
  base: { display: 'inline-flex', color: 'medal.gold', '& svg': { width: '36px', height: '36px' } },
});

export const RoomShelfPodiumTitle = styled('h2', {
  base: { fontSize: '26px', fontWeight: '900', letterSpacing: '-0.02em', textWrap: 'balance' },
});

export const RoomShelfPodiumPlaces = styled('div', {
  base: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '10px', width: '100%', marginBlock: '6px' },
});

export const RoomShelfPodiumPlaceRoot = styled('div', {
  base: { display: 'grid', justifyItems: 'center', gap: '4px', width: '120px', minWidth: '0', animation: 'podiumRise 0.5s ease-out backwards' },
  variants: {
    medal: {
      gold: { order: '2', animationDelay: '0.3s' },
      silver: { order: '1', animationDelay: '0.15s' },
      bronze: { order: '3' },
    },
  },
});

export const RoomShelfPodiumPlaceName = styled('span', {
  base: { maxWidth: '100%', fontSize: '14px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomShelfPodiumPlacePoints = styled('span', {
  base: { fontSize: '13px', fontWeight: '900', color: 'fg.muted', fontVariantNumeric: 'tabular-nums' },
});

export const RoomShelfPodiumPlaceBlock = styled('span', {
  base: { display: 'grid', placeItems: 'center', width: '100%', borderTopRadius: '8px', color: 'sand.1', fontSize: '18px', fontWeight: '900' },
  variants: {
    medal: {
      gold: { height: '88px', bg: 'medal.gold' },
      silver: { height: '64px', bg: 'medal.silver' },
      bronze: { height: '48px', bg: 'medal.bronze' },
    },
  },
});

// An award, with its pages on a sheet of notebook paper.
export const RoomShelfPodiumAward = styled('section', {
  base: { display: 'grid', gap: '12px', width: '100%', padding: '16px', borderRadius: '8px', bg: 'notebook.paper', color: 'notebook.ink', textAlign: 'left' },
});

export const RoomShelfPodiumAwardTitle = styled('h3', {
  base: { fontSize: '15px', fontWeight: '900', textAlign: 'center' },
});

export const RoomShelfPodiumButtons = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '4px' },
});
