import type { NotifItem } from '@/types';
import { NOTIF_ICONS } from '@/constants';
import { Card, CardTitle, CardFooter } from '../ui/Card';
import { CardTypeIcon } from './CardParts';
import styles from './NotifCard.module.css';

interface NotifCardProps {
  item: NotifItem;
}

export const NotifCard = ({ item }: NotifCardProps) => {
  const icon = NOTIF_ICONS[item.type];

  return (
    <Card repo={item.repo} age={item.age}>
      <CardTitle href={item.url}>{item.text}</CardTitle>
      <CardFooter>
        <CardTypeIcon type={item.type} icon={icon} />
        <span className={styles.notifRef}>{item.ref}</span>
      </CardFooter>
    </Card>
  );
};
