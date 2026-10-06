import { defineKeyframes } from '@pandacss/dev';

export const keyframes = defineKeyframes({
  emojiRise: {
    '0%': { transform: 'translate(-50%, 0) scale(0.5)', opacity: '0' },
    '8%': { transform: 'translate(-50%, -28px) scale(1)', opacity: '1' },
    '70%': { opacity: '1' },
    '100%': { transform: 'translate(-50%, calc(-100cqh + 160px)) scale(1.3)', opacity: '0' },
  },
  emojiPop: {
    '0%': { transform: 'translate(-50%, 0) scale(0.6)', opacity: '0' },
    '20%': { transform: 'translate(-50%, -24px) scale(1)', opacity: '1' },
    '100%': { transform: 'translate(-50%, -24px) scale(1)', opacity: '0' },
  },
  swayGentle: {
    from: { transform: 'translateX(-8px) rotate(-5deg)' },
    to: { transform: 'translateX(8px) rotate(5deg)' },
  },
  swayWide: {
    from: { transform: 'translateX(-18px) rotate(-8deg)' },
    to: { transform: 'translateX(18px) rotate(8deg)' },
  },
  swayWobbly: {
    from: { transform: 'translateX(-10px) rotate(-12deg)' },
    to: { transform: 'translateX(10px) rotate(12deg)' },
  },
  // A count or a heart that just changed.
  pop: {
    '0%': { transform: 'scale(1)' },
    '40%': { transform: 'scale(1.3)' },
    '100%': { transform: 'scale(1)' },
  },
  // The last seconds of the clock.
  urgent: {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.08)' },
    '100%': { transform: 'scale(1)' },
  },
  // A step's badge lands like a rubber stamp as the step starts.
  stamp: {
    '0%': { transform: 'scale(2.4) rotate(-14deg)', opacity: '0' },
    '55%': { transform: 'scale(0.92) rotate(-4deg)', opacity: '1' },
    '75%': { transform: 'scale(1.06) rotate(-6deg)' },
    '100%': { transform: 'scale(1) rotate(-5deg)', opacity: '1' },
  },
  // A step's card slides up onto the table.
  deal: {
    from: { transform: 'translateY(28px) rotate(-1.5deg)', opacity: '0' },
    to: { transform: 'translateY(0) rotate(0)', opacity: '1' },
  },
  // A page of the book flips into view at the reveal.
  pageIn: {
    '0%': { transform: 'perspective(900px) rotateX(-75deg) translateY(-20px)', opacity: '0' },
    '60%': { transform: 'perspective(900px) rotateX(8deg)', opacity: '1' },
    '100%': { transform: 'perspective(900px) rotateX(0)', opacity: '1' },
  },
  // A notebook bound at the top (NotebookTurn): the old page lifts slowly from its bottom edge, then
  // swings up until it's edge-on under the rings, where the binding hides it.
  pageTurn: {
    '0%': { transform: 'rotateX(0deg)' },
    '25%': { transform: 'rotateX(13deg)' },
    '72%': { transform: 'rotateX(72deg)' },
    '100%': { transform: 'rotateX(96deg)' },
  },
  // The bottom half of the page bends as it leads the lift, and stays a little curled as it goes.
  pageCurl: {
    '0%': { transform: 'rotateX(0deg)' },
    '30%': { transform: 'rotateX(34deg)' },
    '70%': { transform: 'rotateX(24deg)' },
    '100%': { transform: 'rotateX(12deg)' },
  },
  // The printed side darkens as it curls away from the light.
  pageTurnShade: {
    '0%': { opacity: '0' },
    '50%': { opacity: '1' },
    '100%': { opacity: '1' },
  },
  // The lifting page's shadow on the new page, shrinking back to the binding.
  pageTurnShadow: {
    '0%': { opacity: '0', transform: 'scaleY(1)' },
    '20%': { opacity: '1', transform: 'scaleY(0.92)' },
    '70%': { opacity: '0.6', transform: 'scaleY(0.3)' },
    '100%': { opacity: '0', transform: 'scaleY(0)' },
  },
  // Confetti over the podium.
  confetti: {
    '0%': { transform: 'translate3d(0, -10vh, 0) rotate(0deg)', opacity: '1' },
    '100%': { transform: 'translate3d(var(--drift, 40px), 110vh, 0) rotate(720deg)', opacity: '1' },
  },
  podiumRise: {
    from: { transform: 'translateY(24px)', opacity: '0' },
    to: { transform: 'translateY(0)', opacity: '1' },
  },
  // A gentle nudge on a button that's waiting for you.
  nudge: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-3px)' },
  },
  // The 🎲 rolling.
  roll: {
    '0%': { transform: 'rotate(0deg) scale(1)' },
    '50%': { transform: 'rotate(200deg) scale(1.2)' },
    '100%': { transform: 'rotate(360deg) scale(1)' },
  },
  // A sticker slapped onto a page (spec D25); --tilt is its own.
  stickOn: {
    '0%': { transform: 'translate(-50%, -50%) rotate(calc(var(--tilt) - 18deg)) scale(1.9)', opacity: '0' },
    '55%': { transform: 'translate(-50%, -50%) rotate(var(--tilt)) scale(0.9)', opacity: '1' },
    '100%': { transform: 'translate(-50%, -50%) rotate(var(--tilt)) scale(1)', opacity: '1' },
  },
  // A typing caret.
  blink: {
    '0%': { opacity: '1' },
    '50%': { opacity: '0' },
  },
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  dialogIn: {
    from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
    to: { opacity: '1', transform: 'translateY(0) scale(1)' },
  },
  shimmer: {
    '0%': { opacity: '0.55' },
    '50%': { opacity: '0.85' },
    '100%': { opacity: '0.55' },
  },
});
