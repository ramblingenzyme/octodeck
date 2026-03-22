import type { IssueItem } from "@/types";
import { Card, CardTitle, CardMeta } from "../ui/Card";
import { SvgIcon } from "../ui/SvgIcon";
import { LabelList } from "./LabelList";
import cardStyles from "./Card.module.css";

interface IssueCardProps {
  item: IssueItem;
}

export const IssueCard = ({ item }: IssueCardProps) => {
  return (
    <Card repo={item.repo} age={item.age}>
      <CardTitle href={item.url} prefix={`#${item.number}`}>
        {item.title}
      </CardTitle>
      <LabelList labels={item.labels} repo={item.repo} />
      <CardMeta>
        <span className={cardStyles.cardAuthor}>
          {item.assignee ? (
            <>
              <SvgIcon name="arrowRight" />
              <a href={`https://github.com/${item.assignee}`} target="_blank" rel="noreferrer">
                {item.assignee}
              </a>
            </>
          ) : (
            "unassigned"
          )}
        </span>
        <span className={cardStyles.cardStat} aria-label={`${item.comments} comments`}>
          <SvgIcon name="comment" />
          {item.comments}
        </span>
      </CardMeta>
    </Card>
  );
};
