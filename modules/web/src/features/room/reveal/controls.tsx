import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { DownloadIcon, PlayIcon, SkipIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { RoomRevealControlsButtons, RoomRevealControlsHint, RoomRevealControlsRoot, RoomRevealControlsStatus } from './styled-components';

// The owner's buttons (or everyone's, after the takeover), Save for everyone once the book is
// finished (spec D24), and a line saying what's going on, so nobody has to ask (spec D6, D23).
export const RoomRevealControls = observer(function RoomRevealControls(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { reveal } = room;

  return (
    <RoomRevealControlsRoot>
      {(reveal.canTurn || reveal.canSave) && (
        <RoomRevealControlsButtons>
          {reveal.canSave && (
            <Button tone="secondary" type="button" title={reveal.saveTitle} data-save onClick={reveal.save}>
              <DownloadIcon />
              {t('book.save')}
            </Button>
          )}
          {reveal.canTurn && !reveal.isLastPage && (
            <Button tone="primary" type="button" onClick={reveal.turnPage}>
              <PlayIcon />
              {t('reveal.nextPage')}
            </Button>
          )}
          {reveal.canNextBook && (
            <Button tone="primary" type="button" onClick={reveal.nextBook}>
              <SkipIcon />
              {reveal.nextBookLabel}
            </Button>
          )}
        </RoomRevealControlsButtons>
      )}
      <RoomRevealControlsStatus aria-live="polite">{reveal.status}</RoomRevealControlsStatus>
      {reveal.showsSkipHint && <RoomRevealControlsHint>{t('reveal.skipHint')}</RoomRevealControlsHint>}
      {reveal.likeHint && <RoomRevealControlsHint>{reveal.likeHint}</RoomRevealControlsHint>}
    </RoomRevealControlsRoot>
  );
});
