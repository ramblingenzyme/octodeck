import type { NotifItem } from "@/types";
import { NOTIF_ICONS } from "@/constants";
import cardStyles from "./Card.module.css";
import styles from "./NotifCard.module.css";

interface NotifCardProps {
  item: NotifItem;
}

export const NotifCard = ({ item }: NotifCardProps) => {
  const icon = NOTIF_ICONS[item.type];

  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.cardTop}>
        <span className={cardStyles.cardRepo}>{item.repo}</span>
        <span className={cardStyles.cardAge}>{item.age}</span>
      </div>
      <div className={cardStyles.cardTitle}>
        <span className={styles.notifIcon}>{icon}</span>
        {item.text}
      </div>
      <span className={styles.notifRef}>{item.ref}</span>
    </div>
  );
};
