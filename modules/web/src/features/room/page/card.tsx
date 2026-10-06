import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { PageView } from '../../../stores/room/books';
import { useRootStore } from '../../../stores/use-root-store';
import { Avatar } from '../../../ui';
import { PageDrawing } from './drawing';
import { PageHeart } from './heart';
import { PageSentence } from './sentence';
import {
  PageCardAuthor,
  PageCardBadge,
  PageCardBody,
  PageCardFavourite,
  PageCardFooter,
  PageCardName,
  PageCardRoot,
} from './styled-components';

interface PageCardProps {
  page: PageView;
  tilt: 'left' | 'right';
  // The newest page at the reveal flips in.
  isNew?: boolean;
  replayFrom?: number | null;
  onSkip?: () => void;
  // The owner's favourite pick at the end of their book (spec D7).
  onPickFavourite?: () => void;
}

// One page of a book (spec §4.5): a sentence as a speech bubble with its author, or a drawing as a
// taped-in sheet; hearts, the owner's favourite, and the podium's awards.
export const PageCard = observer(function PageCard({ page, tilt, isNew = false, replayFrom = null, onSkip, onPickFavourite }: PageCardProps): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;

  return (
    <PageCardRoot kind={page.kind} isNew={isNew}>
      <PageCardAuthor>
        <Avatar initial={page.author.initial} color={page.author.color} size="md" />
        <PageCardName tone={page.author.color}>{page.kind === 'drawing' ? t('page.drew', { name: page.author.name }) : page.author.name}</PageCardName>
        {page.award && <PageCardBadge>{t(page.award === 'drawing' ? 'podium.bestDrawing' : 'podium.bestLine')}</PageCardBadge>}
      </PageCardAuthor>
      <PageCardBody>
        {page.kind === 'sentence' ? (
          <PageSentence text={page.text} empty={page.isEmpty} replayFrom={replayFrom} />
        ) : (
          <PageDrawing actions={page.actions} label={t('page.drawingBy', { name: page.author.name })} tilt={tilt} replayFrom={replayFrom} onSkip={onSkip} skipLabel={t('reveal.skip')} />
        )}
      </PageCardBody>
      <PageCardFooter>
        {page.isFavourite && <PageCardBadge>{t('page.favourite')}</PageCardBadge>}
        {onPickFavourite && (
          <PageCardFavourite type="button" onClick={onPickFavourite}>
            {t('page.pickFavourite')}
          </PageCardFavourite>
        )}
        {page.showsLike && <PageHeart page={page} onLike={() => room.books.toggleLike(page.id)} />}
      </PageCardFooter>
    </PageCardRoot>
  );
});
