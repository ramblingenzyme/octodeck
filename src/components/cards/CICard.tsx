import type { CIItem } from "@/types";
import { CI_STATUS } from "@/constants";
import cardStyles from "./Card.module.css";
import styles from "./CICard.module.css";

interface CICardProps {
  item: CIItem;
}

export const CICard = ({ item }: CICardProps) => {
  const status = CI_STATUS[item.status];

  return (
    <div className={`${cardStyles.card} ${styles.ciCard} ${styles[item.status]}`}>
      <div className={cardStyles.cardTop}>
        <span className={cardStyles.cardRepo}>{item.repo}</span>
        <span className={cardStyles.cardAge}>{item.age}</span>
      </div>
      <div className={cardStyles.cardTitle}>{item.name}</div>
      <div className={cardStyles.cardMeta}>
        <span className={cardStyles.cardAuthor}>{item.branch}</span>
        <span className={cardStyles.cardStat} style={{ color: "#6b7280" }}>
          {item.duration}
        </span>
      </div>
      <div style={{ marginTop: "6px" }}>
        <span className={styles.ciBadge}>
          {status.icon} {status.label}
        </span>
      </div>
    </div>
  );
};
