import type { PRItem } from "@/types";
import { Card, CardTitle, CardMeta } from "../ui/Card";
import { SvgIcon } from "../ui/SvgIcon";
import { Tooltip } from "../ui/Tooltip";
import { LabelList } from "./LabelList";
import cardStyles from "./Card.module.css";
import styles from "./PRCard.module.css";

interface PRCardProps {
  item: PRItem;
}

export const PRCard = ({ item }: PRCardProps) => {
  return (
    <Card repo={item.repo} age={item.age}>
      <CardTitle href={item.url} prefix={`#${item.number}`}>
        {item.title}
      </CardTitle>
      <CardMeta>
        <a
          className={cardStyles.cardAuthor}
          href={`https://github.com/${item.author}`}
          target="_blank"
          rel="noreferrer"
        >
          @{item.author}
        </a>
        <div className={cardStyles.cardStats}>
          {item.draft && <span className={styles.draftBadge}>DRAFT</span>}
          <Tooltip text={`${item.reviews.approved} approvals`}>
            <span
              className={
                item.reviews.approved > 0 ? cardStyles.cardStatApproved : cardStyles.cardStat
              }
            >
              <SvgIcon name="check" />
              {item.reviews.approved}
            </span>
          </Tooltip>
          {item.reviews.requested > 0 && (
            <Tooltip text={`${item.reviews.requested} reviews requested`}>
              <span className={cardStyles.cardStatPending}>
                <SvgIcon name="refresh" />
                {item.reviews.requested}
              </span>
            </Tooltip>
          )}
          <Tooltip text={`${item.comments} comments`}>
            <span className={cardStyles.cardStat}>
              <SvgIcon name="comment" />
              {item.comments}
            </span>
          </Tooltip>
        </div>
      </CardMeta>
      <LabelList labels={item.labels} repo={item.repo} />
    </Card>
  );
};
