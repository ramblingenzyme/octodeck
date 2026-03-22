import type { IconName } from "@/types";
import { formatAge } from "@/utils/relativeTime";
import { Tooltip } from "../ui/Tooltip";
import { SvgIcon } from "../ui/SvgIcon";
import styles from "./CardParts.module.css";

const statVariantClass = {
  default: styles.cardStat,
  approved: styles.cardStatApproved,
  pending: styles.cardStatPending,
} as const;

interface CardStatProps {
  icon: IconName;
  count: number;
  tooltip?: string;
  variant?: keyof typeof statVariantClass;
}

export const CardStat = ({ icon, count, tooltip, variant = "default" }: CardStatProps) => {
  const inner = (
    <span className={statVariantClass[variant]}>
      <SvgIcon name={icon} />
      {count}
    </span>
  );
  return tooltip ? <Tooltip text={tooltip}>{inner}</Tooltip> : inner;
};

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
