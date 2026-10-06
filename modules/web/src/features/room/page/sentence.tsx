import type { ReactElement } from 'react';
import { PageCardBubble, PageSentenceTyped, PageSentenceWhole } from './styled-components';
import { usePageTyping } from './use-typing';

interface PageSentenceProps {
  text: string;
  empty: boolean;
  // The sentence types itself out from here; null shows it whole.
  replayFrom?: number | null;
}

// A sentence as a speech bubble. The whole sentence holds the bubble's size (and is what screen
// readers read) while the typed copy fills in over it.
export function PageSentence({ text, empty, replayFrom = null }: PageSentenceProps): ReactElement {
  const typedRef = usePageTyping(text, replayFrom);

  return (
    <PageCardBubble empty={empty}>
      <PageSentenceWhole>{text}</PageSentenceWhole>
      <PageSentenceTyped ref={typedRef} aria-hidden />
    </PageCardBubble>
  );
}
