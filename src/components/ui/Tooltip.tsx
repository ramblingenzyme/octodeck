import { useId, useRef } from "preact/hooks";
import styles from "./Tooltip.module.css";

interface TooltipProps {
  text: React.ReactNode;
  children: React.ReactNode;
  position?: "above" | "below";
  align?: "center" | "end";
  className?: string;
}

export const Tooltip = ({
  text,
  children,
  position = "above",
  align = "center",
  className,
}: TooltipProps) => {
  const id = useId();
  const popoverRef = useRef<HTMLSpanElement>(null);
  const anchorName = `--tooltip-${id.replace(/:/g, "")}`;

  const show = () => (popoverRef.current as any)?.showPopover?.();
  const hide = () => (popoverRef.current as any)?.hidePopover?.();

  return (
    <span
      className={`${styles.wrapper}${className ? ` ${className}` : ""}`}
      aria-describedby={id}
      style={{ anchorName } as React.CSSProperties}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusIn={show}
      onBlurCapture={hide}
    >
      {children}
      <span
        ref={popoverRef}
        role="tooltip"
        id={id}
        popover="hint"
        className={[styles[position], align === "end" ? styles.end : ""].filter(Boolean).join(" ")}
        style={{ positionAnchor: anchorName } as React.CSSProperties}
      >
        {text}
      </span>
    </span>
  );
};
