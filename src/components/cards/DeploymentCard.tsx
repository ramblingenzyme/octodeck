import type { DeploymentItem } from "@/types";
import { DEPLOYMENT_STATUS } from "@/constants";
import { Card, CardTitle, CardMeta } from "../ui/Card";
import { SvgIcon } from "../ui/SvgIcon";
import cardStyles from "./Card.module.css";
import styles from "./DeploymentCard.module.css";

interface DeploymentCardProps {
  item: DeploymentItem;
}

export const DeploymentCard = ({ item }: DeploymentCardProps) => {
  const status = DEPLOYMENT_STATUS[item.status];

  return (
    <Card repo={item.repo} age={item.age} className={styles[item.status]}>
      <CardTitle href={item.url}>{item.environment}</CardTitle>
      <CardMeta>
        <span className={cardStyles.cardAuthor}>
          {item.ref} · {item.creator}
        </span>
        <span className={styles.deployBadge}>
          <SvgIcon name={status.icon} /> {status.label}
        </span>
      </CardMeta>
    </Card>
  );
};
