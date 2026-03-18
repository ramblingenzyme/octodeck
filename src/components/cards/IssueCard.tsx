import type { IssueItem } from '@/types';
import { Card, CardTitle, CardMeta } from '../ui/Card';
import { CommentIcon } from './CommentIcon';
import { LabelList } from './LabelList';
import cardStyles from './Card.module.css';

interface IssueCardProps {
  item: IssueItem;
}

export const IssueCard = ({ item }: IssueCardProps) => {
  return (
    <Card repo={item.repo} age={item.age}>
      <CardTitle href={item.url} prefix={`#${item.number}`}>{item.title}</CardTitle>
      <CardMeta>
        <span className={cardStyles.cardAuthor}>
          {item.assignee ? `→ ${item.assignee}` : 'unassigned'}
        </span>
        <span className={cardStyles.cardStat} aria-label={`${item.comments} comments`}>
          <CommentIcon />
          {item.comments}
        </span>
      </CardMeta>
      <LabelList labels={item.labels} />
    </Card>
  );
};
