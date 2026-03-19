import type { FallbackItem } from '@/types';
import { Card, CardTitle } from '../ui/Card';
import styles from './FallbackCard.module.css';

export const FallbackCard = ({ item }: { item: FallbackItem }) => (
  <Card repo={item.repo} age={item.age}>
    <CardTitle href={item.url}>{item.title}</CardTitle>
    <textarea
      className={styles.json}
      readOnly
      value={JSON.stringify(item, null, 2)}
    />
  </Card>
);
