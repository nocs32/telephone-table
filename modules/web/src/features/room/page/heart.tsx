import type { ReactElement } from 'react';
import type { PageView } from '../../../stores/room/books';
import { PageHeartButton, PageHeartCount, PageHeartIcon } from './styled-components';

interface PageHeartProps {
  page: PageView;
  onLike: () => void;
}

// ❤️ a page (spec §5.5): +1 to its author, and it can be taken back. Your own pages just show
// their count.
export function PageHeart({ page, onLike }: PageHeartProps): ReactElement {
  return (
    <PageHeartButton type="button" liked={page.liked} disabled={!page.canLike} aria-pressed={page.liked} aria-label={page.likeLabel} title={page.likeLabel} onClick={onLike}>
      <PageHeartIcon key={page.liked ? 'on' : 'off'} liked={page.liked} aria-hidden>
        {page.liked || page.isMine ? '❤️' : '🤍'}
      </PageHeartIcon>
      {page.likeCount > 0 && <PageHeartCount>{page.likeCount}</PageHeartCount>}
    </PageHeartButton>
  );
}
