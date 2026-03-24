import type { IssueItem } from "@/types";
import { Card, CardTitle, CardFooter } from "../ui/Card";
import { SvgIcon } from "../ui/SvgIcon";
import { UserLink } from "../ui/UserLink";
import { LabelList } from "./LabelList";
import { CardStat } from "./CardParts";
import styles from "./IssueCard.module.css";

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
        <span className={styles.assignee}>
          {item.assignee ? (
            <>
              <SvgIcon name="arrowRight" />
              <UserLink username={item.assignee} />
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
