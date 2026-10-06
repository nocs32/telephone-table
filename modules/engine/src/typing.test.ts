import { expect, test } from 'vitest';
import { typedText, typingMs } from './typing.js';

test('typing takes half a second to two seconds, whatever the length', () => {
  expect(typingMs('Hi')).toBe(500);
  expect(typingMs('x'.repeat(20))).toBe(900);
  expect(typingMs('x'.repeat(100))).toBe(2000);
});

test('the sentence grows letter by letter, ending whole', () => {
  expect(typedText('A sleepy wizard', 0)).toBe('');
  expect(typedText('A sleepy wizard', 0.5)).toBe('A sleepy');
  expect(typedText('A sleepy wizard', 1)).toBe('A sleepy wizard');
  expect(typedText('A sleepy wizard', 7)).toBe('A sleepy wizard');
});

test('an emoji is never cut in half', () => {
  expect(typedText('🎲🎲', 0.5)).toBe('🎲');
});
