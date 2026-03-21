import type { SecurityItem } from "@/types";
import { Card, CardTitle, CardMeta } from "../ui/Card";
import styles from "./SecurityCard.module.css";

interface SecurityCardProps {
  item: SecurityItem;
}

export const SecurityCard = ({ item }: SecurityCardProps) => (
  <Card repo={item.repo} age={item.age} className={styles[item.severity]}>
    <CardTitle href={item.url}>{item.summary}</CardTitle>
    <CardMeta>
      <span className={styles.package}>{item.package}</span>
      <span className={styles.severityBadge}>{item.severity}</span>
    </CardMeta>
  </Card>
);
