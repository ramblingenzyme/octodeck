import type { IssueItem } from "@/types";
import { Card, CardTitle, CardFooter } from "../ui/Card";
import { SvgIcon } from "../ui/SvgIcon";
import { LabelList } from "./LabelList";
import { CardStat } from "./CardParts";
import cardStyles from "../ui/Card.module.css";

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
      <CardFooter>
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
        <CardStat icon="comment" count={item.comments} tooltip={`${item.comments} comments`} />
      </CardFooter>
    </Card>
  );
};
