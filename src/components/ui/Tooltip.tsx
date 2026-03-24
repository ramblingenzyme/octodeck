import { useId, useRef } from "preact/hooks";
import styles from "./Tooltip.module.css";
import { cloneElement, toChildArray, VNode } from "preact";

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

  const show = () => popoverRef.current?.showPopover?.();
  const hide = () => popoverRef.current?.hidePopover?.();

  const cloneWithHandlers = (node: VNode<HTMLElement>) => {
    return cloneElement(node, {
      style: { ...node.props.style, anchorName },
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocusIn: show,
      onBlurCapture: hide,
    });
  };

  const wrapWithSpan = (node: string | number) => {
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
        {node}
      </span>
    );
  };

  const newChildren = toChildArray(children).map((child) => {
    if (typeof child == "string" || typeof child == "number") {
      return wrapWithSpan(child);
    } else {
      return cloneWithHandlers(child);
    }
  });

  return (
    <>
      {newChildren}
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
    </>
  );
};
