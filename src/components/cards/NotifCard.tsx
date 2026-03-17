import type { NotifItem } from "@/types";
import { NOTIF_ICONS } from "@/constants";
import cardStyles from "./Card.module.css";
import { CardTop, CardTypeIcon } from "./CardParts";
import styles from "./NotifCard.module.css";

interface NotifCardProps {
  item: NotifItem;
}

export const NotifCard = ({ item }: NotifCardProps) => {
  const icon = NOTIF_ICONS[item.type];

  return (
    <article className={cardStyles.card}>
      <CardTop repo={item.repo} age={item.age} />
      <p className={cardStyles.cardTitle}>
        <a href={item.url} target="_blank" rel="noreferrer" className={cardStyles.cardTitleLink}>
          {item.text}
        </a>
      </p>
      <footer className={cardStyles.cardFooter}>
        <CardTypeIcon type={item.type} icon={icon} />
        <span className={styles.notifRef}>{item.ref}</span>
      </footer>
    </article>
  );
};
