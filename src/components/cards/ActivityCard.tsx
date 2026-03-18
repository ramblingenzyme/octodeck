import type { ActivityItem } from '@/types';
import { ACTIVITY_ICONS } from '@/constants';
import { Card, CardTitle, CardFooter } from '../ui/Card';
import { CardTypeIcon } from './CardParts';
import styles from './ActivityCard.module.css';

interface ActivityCardProps {
  item: ActivityItem;
}

export const ActivityCard = ({ item }: ActivityCardProps) => {
  const icon = ACTIVITY_ICONS[item.type];

  return (
    <Card repo={item.repo} age={item.age}>
      <CardTitle href={item.url}>{item.text}</CardTitle>
      <CardFooter>
        <CardTypeIcon type={item.type} icon={icon} />
        {item.ref && <span className={styles.activityRef}>{item.ref}</span>}
      </CardFooter>
    </Card>
  );
};
