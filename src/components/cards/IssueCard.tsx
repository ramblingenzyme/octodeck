import type { IssueItem } from "@/types";
import cardStyles from "./Card.module.css";
import styles from "./IssueCard.module.css";
import labelStyles from "./Label.module.css";

interface IssueCardProps {
  item: IssueItem;
}

export const IssueCard = ({ item }: IssueCardProps) => {
  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.cardTop}>
        <span className={cardStyles.cardRepo}>{item.repo}</span>
        <span className={cardStyles.cardAge}>{item.age}</span>
      </div>
      <div className={cardStyles.cardTitle}>
        #{item.number} {item.title}
      </div>
      <div className={cardStyles.cardMeta}>
        <span className={cardStyles.cardAuthor}>{item.assignee ? `→ ${item.assignee}` : "unassigned"}</span>
        <span className={cardStyles.cardStat} style={{ color: "#6b7280" }}>
          💬{item.comments}
        </span>
      </div>
      {item.labels.length > 0 && (
        <div className={styles.labelList}>
          {item.labels.map((l) => (
            <span key={l} className={`${styles.label} ${labelStyles[l] ?? labelStyles.fallback}`}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
};
