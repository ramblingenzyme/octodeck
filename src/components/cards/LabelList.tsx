import type { Label } from "@/types";
import labelStyles from "./Label.module.css";

interface LabelListProps {
  labels: Label[];
  repo: string;
}

export const LabelList = ({ labels, repo }: LabelListProps) => {
  if (labels.length === 0) return null;
  return (
    <ul className={labelStyles.labelList}>
      {labels.map((l) => {
        if (!l.color) {
          return (
            <li key={l.name}>
              <a
                className={`${labelStyles.label} ${labelStyles.fallback}`}
                href={`https://github.com/${repo}/labels/${encodeURIComponent(l.name)}`}
                target="_blank"
                rel="noreferrer"
              >
                {l.name}
              </a>
            </li>
          );
        }
        return (
          <li key={l.name}>
            <a
              className={`${labelStyles.label} ${labelStyles.colored}`}
              style={{ "--label-color": `#${l.color}` } as React.CSSProperties}
              href={`https://github.com/${repo}/labels/${encodeURIComponent(l.name)}`}
              target="_blank"
              rel="noreferrer"
            >
              {l.name}
            </a>
          </li>
        );
      })}
    </ul>
  );
};
