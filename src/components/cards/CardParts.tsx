import { Icon } from '../Icon';
import { CommentIcon } from './CommentIcon';
import styles from './Card.module.css';

interface CardTopProps {
  repo: string;
  age: string;
}

export const CardTop = ({ repo, age }: CardTopProps) => (
  <header className={styles.cardTop}>
    <span className={styles.cardRepo}>{repo}</span>
    <span className={styles.cardAge}>{age}</span>
  </header>
);

interface CardTypeIconProps {
  type: string;
  icon: string;
}

export const CardTypeIcon = ({ type, icon }: CardTypeIconProps) =>
  type === 'comment' ? <CommentIcon /> : <Icon className={styles.cardIcon}>{icon}</Icon>;
