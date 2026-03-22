import type { IconName } from "@/types";
import { formatAge } from "@/utils/relativeTime";
import { Tooltip } from "../ui/Tooltip";
import { SvgIcon } from "../ui/SvgIcon";
import styles from "./Card.module.css";

interface CardTopProps {
  repo: string;
  age: string;
}

export const CardTop = ({ repo, age }: CardTopProps) => (
  <header>
    <span className={styles.cardRepo}>
      <a href={`https://github.com/${repo}`} target="_blank" rel="noreferrer">
        {repo}
      </a>
    </span>
    <Tooltip text={new Date(age).toLocaleString()} position="below">
      <time dateTime={age}>{formatAge(age)}</time>
    </Tooltip>
  </header>
);

interface CardTypeIconProps {
  icon: IconName;
}

export const CardTypeIcon = ({ icon }: CardTypeIconProps) => (
  <SvgIcon name={icon} className={styles.cardIcon} />
);
