import type { IssueItem } from "@/types";
import cardStyles from "./Card.module.css";
import { CardTop } from "./CardParts";
import { CommentIcon } from "./CommentIcon";
import { LabelList } from "./LabelList";

interface IssueCardProps {
  item: IssueItem;
}

export const IssueCard = ({ item }: IssueCardProps) => {
  return (
    <article className={cardStyles.card}>
      <CardTop repo={item.repo} age={item.age} />
      <p className={cardStyles.cardTitle}>
        #{item.number} {item.title}
      </p>
      <footer className={cardStyles.cardMeta}>
        <span className={cardStyles.cardAuthor}>{item.assignee ? `→ ${item.assignee}` : "unassigned"}</span>
        <span className={cardStyles.cardStat} aria-label={`${item.comments} comments`}>
          <CommentIcon />{item.comments}
        </span>
      </footer>
      <LabelList labels={item.labels} />
    </article>
  );
};
