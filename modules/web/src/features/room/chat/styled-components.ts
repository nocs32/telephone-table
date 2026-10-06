import { styled } from 'styled-system/jsx';

// The floating card. Position and size come from CSS variables set by useRoomChatWidget.
export const RoomChatWidgetRoot = styled('section', {
  base: {
    position: 'absolute',
    top: '0',
    left: '0',
    zIndex: '5',
    display: 'flex',
    flexDirection: 'column',
    width: 'var(--widget-width)',
    height: 'var(--widget-height)',
    borderRadius: '12px',
    overflow: 'hidden',
    bg: 'bg.surface',
    color: 'fg.default',
    boxShadow: 'floating',
    transform: 'translate3d(var(--widget-x), var(--widget-y), 0)',
    animation: 'fadeIn 0.15s ease-out',
    '&:hover [data-widget-resize], &:focus-within [data-widget-resize]': { opacity: '1' },
  },
  variants: {
    gesture: {
      idle: {},
      pressed: {},
      moving: { boxShadow: 'dialog', userSelect: 'none', '& [data-widget-move]': { cursor: 'grabbing' } },
      resizing: { boxShadow: 'dialog', userSelect: 'none', cursor: 'nwse-resize' },
    },
  },
});

// The bottom-right grip. Shows on hover (always on touch screens).
export const RoomChatWidgetResize = styled('div', {
  base: {
    position: 'absolute',
    right: '0',
    bottom: '0',
    zIndex: '1',
    width: '20px',
    height: '20px',
    cursor: 'nwse-resize',
    touchAction: 'none',
    opacity: '0',
    transition: 'opacity 0.12s ease',
    '@media (hover: none)': { opacity: '1' },
    _after: {
      content: '""',
      position: 'absolute',
      right: '5px',
      bottom: '5px',
      width: '9px',
      height: '9px',
      borderRight: '2px solid',
      borderBottom: '2px solid',
      borderColor: 'fg.muted',
      borderBottomRightRadius: '3px',
    },
  },
});

// "Too fast: send it again in a moment."
export const RoomChatComposerNote = styled('p', {
  base: { marginInline: '12px', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'accent.text' },
});

// The drag handle: the whole header bar.
export const RoomChatHeader = styled('header', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    height: '42px',
    flexShrink: '0',
    paddingLeft: '14px',
    paddingRight: '6px',
    borderBottom: '1px solid',
    borderColor: 'border.subtle',
    cursor: 'grab',
    userSelect: 'none',
    touchAction: 'none',
  },
});

export const RoomChatTitle = styled('h2', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '900',
    '& svg': { width: '16px', height: '16px', color: 'fg.muted' },
  },
});

export const RoomChatComposerRoot = styled('form', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: '0',
    marginInline: '10px',
    marginBottom: '10px',
    paddingBlock: '4px',
    paddingLeft: '12px',
    paddingRight: '4px',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'border.default',
    bg: 'bg.subtle',
    _focusWithin: { borderColor: 'border.strong', boxShadow: '0 0 0 1px {colors.border.strong}' },
  },
});

export const RoomChatComposerInput = styled('input', {
  base: {
    flex: '1',
    minWidth: '0',
    height: '32px',
    bg: 'transparent',
    fontSize: '15px',
    outline: 'none',
    _placeholder: { color: 'fg.subtle' },
  },
});

export const RoomChatComposerSend = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    color: 'fg.muted',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease',
    _disabled: { cursor: 'default', opacity: '0.5' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '& svg': { width: '16px', height: '16px' },
  },
  variants: {
    ready: {
      true: { bg: 'action.primary', color: 'fg.onAccent', _hover: { bg: 'action.primaryHover' } },
      false: {},
    },
  },
  defaultVariants: { ready: false },
});
