import type { Label } from "@/types";
import labelStyles from "./Label.module.css";

interface LabelListProps {
  labels: Label[];
}

export const LabelList = ({ labels }: LabelListProps) => {
  if (labels.length === 0) return null;
  return (
    <ul className={labelStyles.labelList}>
      {labels.map((l) => {
        if (!l.color) {
          return (
            <li key={l.name}>
              <span className={`${labelStyles.label} ${labelStyles.fallback}`}>{l.name}</span>
            </li>
          );
        }
        return (
          <li key={l.name}>
            <span
              className={`${labelStyles.label} ${labelStyles.colored}`}
              style={{ "--label-color": `#${l.color}` } as React.CSSProperties}
            >
              {l.name}
            </span>
          </li>
        );
      })}
    </ul>
  );
};
