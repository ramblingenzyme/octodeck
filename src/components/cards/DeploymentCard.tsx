import type { DeploymentItem } from "@/types";
import { DEPLOYMENT_STATUS } from "@/constants";
import { Card, CardTitle, CardFooter } from "../ui/Card";
import { SvgIcon } from "../ui/SvgIcon";
import { UserLink } from "../ui/UserLink";
import { RefLink } from "../ui/RefLink";
import styles from "./DeploymentCard.module.css";

interface DeploymentCardProps {
  item: DeploymentItem;
}

export const DeploymentCard = ({ item }: DeploymentCardProps) => {
  const status = DEPLOYMENT_STATUS[item.status];

  return (
    <Card repo={item.repo} age={item.age} className={styles[item.status]}>
      <CardTitle href={item.url}>{item.environment}</CardTitle>
      <CardFooter>
        <span className={styles.deployMeta}>
          <RefLink repo={item.repo} gitRef={item.ref} /> · <UserLink username={item.creator} />
        </span>
        <span className={styles.deployBadge}>
          <SvgIcon name={status.icon} /> {status.label}
        </span>
      </CardFooter>
    </Card>
  );
};
