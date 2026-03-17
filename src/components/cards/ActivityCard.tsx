import type { ActivityItem } from "@/types";
import { ACTIVITY_ICONS } from "@/constants";
import cardStyles from "./Card.module.css";
import { CardTop, CardTypeIcon } from "./CardParts";
import styles from "./ActivityCard.module.css";

interface ActivityCardProps {
  item: ActivityItem;
}

export const ActivityCard = ({ item }: ActivityCardProps) => {
  const icon = ACTIVITY_ICONS[item.type];

  return (
    <article className={cardStyles.card}>
      <CardTop repo={item.repo} age={item.age} />
      <p className={cardStyles.cardTitle}>{item.text}</p>
      <footer className={cardStyles.cardFooter}>
        <CardTypeIcon type={item.type} icon={icon} />
        {item.ref && <span className={styles.activityRef}>{item.ref}</span>}
      </footer>
    </article>
  );
};
