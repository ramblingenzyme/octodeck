import type { CIItem } from "@/types";
import { CI_STATUS } from "@/constants";
import cardStyles from "./Card.module.css";
import { CardTop } from "./CardParts";
import { Icon } from "../Icon";
import styles from "./CICard.module.css";

interface CICardProps {
  item: CIItem;
}

export const CICard = ({ item }: CICardProps) => {
  const status = CI_STATUS[item.status];

  return (
    <article className={`${cardStyles.card} ${styles[item.status]}`}>
      <CardTop repo={item.repo} age={item.age} />
      <p className={cardStyles.cardTitle}>{item.name}</p>
      <footer className={cardStyles.cardMeta}>
        <span className={cardStyles.cardAuthor}>{item.branch} · {item.duration}</span>
        <span className={styles.ciBadge}>
          <Icon>{status.icon}</Icon> {status.label}
        </span>
      </footer>
    </article>
  );
};
