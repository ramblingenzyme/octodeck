import labelStyles from "./Label.module.css";

interface LabelListProps {
  labels: string[];
}

export const LabelList = ({ labels }: LabelListProps) => {
  if (labels.length === 0) return null;
  return (
    <ul className={labelStyles.labelList}>
      {labels.map((l) => (
        <li key={l}>
          <span className={`${labelStyles.label} ${labelStyles[l] ?? labelStyles.fallback}`}>
            {l}
          </span>
        </li>
      ))}
    </ul>
  );
};
