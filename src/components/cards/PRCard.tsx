import type { PRItem } from "@/types";
import cardStyles from "./Card.module.css";
import { CardTop } from "./CardParts";
import { Icon } from "../Icon";
import { CommentIcon } from "./CommentIcon";
import { LabelList } from "./LabelList";
import styles from "./PRCard.module.css";

interface PRCardProps {
  item: PRItem;
}

export const PRCard = ({ item }: PRCardProps) => {
  return (
    <article className={cardStyles.card}>
      <CardTop repo={item.repo} age={item.age} />
      <p className={cardStyles.cardTitle}>
        <a href={item.url} target="_blank" rel="noreferrer" className={cardStyles.cardTitleLink}>
          #{item.number} {item.title}
        </a>
      </p>
      <footer className={cardStyles.cardMeta}>
        <span className={cardStyles.cardAuthor}>@{item.author}</span>
        <div className={cardStyles.cardStats}>
          {item.draft && <span className={styles.draftBadge}>DRAFT</span>}
          <span
            className={item.reviews.approved > 0 ? cardStyles.cardStatApproved : cardStyles.cardStat}
            aria-label={`${item.reviews.approved} approvals`}
          >
            <Icon>✓</Icon>{item.reviews.approved}
          </span>
          {item.reviews.requested > 0 && (
            <span className={cardStyles.cardStatPending} aria-label={`${item.reviews.requested} reviews requested`}>
              <Icon>⟳</Icon>{item.reviews.requested}
            </span>
          )}
          <span className={cardStyles.cardStat} aria-label={`${item.comments} comments`}>
            <CommentIcon />{item.comments}
          </span>
        </div>
      </footer>
      <LabelList labels={item.labels} />
    </article>
  );
};
