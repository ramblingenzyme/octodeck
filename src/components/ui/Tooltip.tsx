import { useId } from "preact/hooks";
import styles from "./Tooltip.module.css";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: "above" | "below";
}

export const Tooltip = ({ text, children, position = "above" }: TooltipProps) => {
  const id = useId();
  return (
    <span className={styles.wrapper} aria-describedby={id}>
      {children}
      <span role="tooltip" id={id} className={`${styles.tooltip} ${styles[position]}`}>
        {text}
      </span>
    </span>
  );
};
