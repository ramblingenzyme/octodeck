import type { PRItem } from "@/types";
import { Card, CardTitle, CardFooter } from "../ui/Card";
import { LabelList } from "./LabelList";
import { CardStat } from "./CardParts";
import { UserLink } from "../ui/UserLink";
import cardStyles from "../ui/Card.module.css";
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
      <CardFooter>
        <UserLink username={item.author} />
        <div className={cardStyles.cardStats}>
          {item.draft && <span className={styles.draftBadge}>DRAFT</span>}
          <CardStat
            icon="check"
            count={item.reviews.approved}
            tooltip={`${item.reviews.approved} approvals`}
            variant={item.reviews.approved > 0 ? "approved" : "default"}
          />
          {item.reviews.requested > 0 && (
            <CardStat
              icon="refresh"
              count={item.reviews.requested}
              tooltip={`${item.reviews.requested} reviews requested`}
              variant="pending"
            />
          )}
          <CardStat icon="comment" count={item.comments} tooltip={`${item.comments} comments`} />
        </div>
      </CardFooter>
      <LabelList labels={item.labels} repo={item.repo} />
    </Card>
  );
};
