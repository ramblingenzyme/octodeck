import type { IconName } from "@/types";
import styles from "./SvgIcon.module.css";
import { CheckIcon } from "./icons/CheckIcon";
import { XIcon } from "./icons/XIcon";
import { RefreshIcon } from "./icons/RefreshIcon";
import { CircleDotIcon } from "./icons/CircleDotIcon";
import { AtIcon } from "./icons/AtIcon";
import { ArrowRightIcon } from "./icons/ArrowRightIcon";
import { GripIcon } from "./icons/GripIcon";
import { CommentIcon } from "./icons/CommentIcon";
import { BellIcon } from "./icons/BellIcon";
import { GitMergeIcon } from "./icons/GitMergeIcon";
import { GitCommitIcon } from "./icons/GitCommitIcon";
import { EyeIcon } from "./icons/EyeIcon";
import { PlayIcon } from "./icons/PlayIcon";
import { IssueOpenIcon } from "./icons/IssueOpenIcon";
import { TagIcon } from "./icons/TagIcon";
import { GitBranchIcon } from "./icons/GitBranchIcon";
import { GitForkIcon } from "./icons/GitForkIcon";
import { StarIcon } from "./icons/StarIcon";
import { DeployIcon } from "./icons/DeployIcon";
import { ShieldIcon } from "./icons/ShieldIcon";

const ICON_MAP = {
  check: CheckIcon,
  x: XIcon,
  refresh: RefreshIcon,
  circleDot: CircleDotIcon,
  at: AtIcon,
  arrowRight: ArrowRightIcon,
  grip: GripIcon,
  comment: CommentIcon,
  bell: BellIcon,
  gitMerge: GitMergeIcon,
  gitCommit: GitCommitIcon,
  eye: EyeIcon,
  play: PlayIcon,
  issueOpen: IssueOpenIcon,
  tag: TagIcon,
  gitBranch: GitBranchIcon,
  gitFork: GitForkIcon,
  star: StarIcon,
  deploy: DeployIcon,
  shield: ShieldIcon,
} as const;

export const SvgIcon = ({ name, className }: { name: IconName; className?: string }) => {
  const Comp = ICON_MAP[name];
  return <Comp className={`${styles.icon}${className ? ` ${className}` : ""}`} />;
};
