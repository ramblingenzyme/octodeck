import type { ReleaseItem } from "@/types";
import { Card, CardTitle, CardMeta } from "../ui/Card";
import cardStyles from "./Card.module.css";
import styles from "./ReleaseCard.module.css";

interface ReleaseCardProps {
  item: ReleaseItem;
}

function stripTagPrefix(tag: string, name: string): string {
  const stripped = name.startsWith(tag) ? name.slice(tag.length).replace(/^[\s\-–—:]+/, "") : name;
  return stripped || name;
}

export const ReleaseCard = ({ item }: ReleaseCardProps) => {
  const subtitle = stripTagPrefix(item.tag, item.name);
  const hasSubtitle = subtitle !== item.tag;

  return (
    <Card repo={item.repo} age={item.age}>
      <CardTitle href={item.url}>{item.tag}</CardTitle>
      <CardMeta>
        {hasSubtitle && <span className={cardStyles.cardAuthor}>{subtitle}</span>}
        {item.prerelease && <span className={styles.prereleaseBadge}>pre-release</span>}
      </CardMeta>
    </Card>
  );
};
