import type { PRItem } from "@/types";
import cardStyles from "./Card.module.css";
import styles from "./PRCard.module.css";
import labelStyles from "./Label.module.css";

interface PRCardProps {
  item: PRItem;
}

export const PRCard = ({ item }: PRCardProps) => {
  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.cardTop}>
        <span className={cardStyles.cardRepo}>{item.repo}</span>
        <span className={cardStyles.cardAge}>{item.age}</span>
      </div>
      <div className={cardStyles.cardTitle}>
        {item.draft && <span className={styles.draftBadge}>DRAFT</span>}#{item.number} {item.title}
      </div>
      <div className={cardStyles.cardMeta}>
        <span className={cardStyles.cardAuthor}>@{item.author}</span>
        <div className={cardStyles.cardStats}>
          <span
            className={cardStyles.cardStat}
            style={{
              color: item.reviews.approved > 0 ? "#4ade80" : "#6b7280",
            }}
          >
            ✓{item.reviews.approved}
          </span>
          {item.reviews.requested > 0 && (
            <span className={cardStyles.cardStat} style={{ color: "#fbbf24" }}>
              ⟳{item.reviews.requested}
            </span>
          )}
          <span className={cardStyles.cardStat} style={{ color: "#6b7280" }}>
            💬{item.comments}
          </span>
        </div>
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
