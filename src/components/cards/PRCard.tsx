import type { PRItem } from '@/types';
import { Card, CardTitle, CardMeta } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { CommentIcon } from './CommentIcon';
import { LabelList } from './LabelList';
import cardStyles from './Card.module.css';
import styles from './PRCard.module.css';

interface PRCardProps {
  item: PRItem;
}

export const PRCard = ({ item }: PRCardProps) => {
  return (
    <Card repo={item.repo} age={item.age}>
      <CardTitle href={item.url} prefix={`#${item.number}`}>{item.title}</CardTitle>
      <CardMeta>
        <span className={cardStyles.cardAuthor}>@{item.author}</span>
        <div className={cardStyles.cardStats}>
          {item.draft && <span className={styles.draftBadge}>DRAFT</span>}
          <span
            className={
              item.reviews.approved > 0 ? cardStyles.cardStatApproved : cardStyles.cardStat
            }
            aria-label={`${item.reviews.approved} approvals`}
          >
            <Icon>✓</Icon>
            {item.reviews.approved}
          </span>
          {item.reviews.requested > 0 && (
            <span
              className={cardStyles.cardStatPending}
              aria-label={`${item.reviews.requested} reviews requested`}
            >
              <Icon>⟳</Icon>
              {item.reviews.requested}
            </span>
          )}
          <span className={cardStyles.cardStat} aria-label={`${item.comments} comments`}>
            <CommentIcon />
            {item.comments}
          </span>
        </div>
      </CardMeta>
      <LabelList labels={item.labels} />
    </Card>
  );
};
