import type { ActivityItem } from "@/types";
import { ACTIVITY_ICONS } from "@/constants";
import cardStyles from "./Card.module.css";
import styles from "./ActivityCard.module.css";

interface ActivityCardProps {
  item: ActivityItem;
}

export const ActivityCard = ({ item }: ActivityCardProps) => {
  const icon = ACTIVITY_ICONS[item.type];

  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.cardTop}>
        <span className={cardStyles.cardRepo}>{item.repo}</span>
        <span className={cardStyles.cardAge}>{item.age}</span>
      </div>
      <div className={cardStyles.cardTitle}>
        <span className={styles.activityIcon}>{icon}</span>
        {item.text}
      </div>
      {item.sha && <span className={styles.activitySha}>{item.sha}</span>}
    </div>
  );
};
