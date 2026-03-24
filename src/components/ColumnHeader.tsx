import { useId, useState } from "preact/hooks";
import type { CSSProperties, RefObject } from "preact";
import type { ColumnConfig } from "@/types";
import { COLUMN_TYPES } from "@/constants";
import { SvgIcon, type IconName } from "./ui/SvgIcon";
import { Tooltip } from "./ui/Tooltip";
import styles from "./ColumnHeader.module.css";

interface ColumnHeaderProps {
  col: ColumnConfig;
  handleRef: RefObject<HTMLButtonElement>;
  itemCount: number;
  isFetching: boolean;
  spinning: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
  onConfirmRemove: () => void;
  onOpenSettings: () => void;
}

function formatAge(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1m ago";
  return `${mins}m ago`;
}

const IconButton = ({
  iconName,
  tooltip,
  className,
  onClick,
}: {
  iconName: IconName;
  tooltip: string;
  className?: string;
  onClick: () => void;
}) => (
  <Tooltip text={tooltip} position="below">
    <button className={`${styles.btnIcon} ${className}`} onClick={onClick} aria-label={tooltip}>
      <SvgIcon name={iconName} />
    </button>
  </Tooltip>
);

export const ColumnHeader = ({
  col,
  handleRef,
  itemCount,
  isFetching,
  spinning,
  lastUpdated,
  onRefresh,
  onConfirmRemove,
  onOpenSettings,
}: ColumnHeaderProps) => {
  const cfg = COLUMN_TYPES[col.type];
  const itemLabel = itemCount === 1 ? cfg.itemLabel : `${cfg.itemLabel}s`;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const anchorName = `--col-menu-${menuId.replace(/:/g, "")}`;

  const dragButton = (
    <button
      ref={handleRef}
      type="button"
      className={styles.dragHandle}
      aria-label="Column options"
      aria-haspopup="menu"
      aria-expanded={menuOpen}
      popovertarget={menuId}
      style={{ anchorName } as CSSProperties}
    >
      <SvgIcon name="grip" />
    </button>
  );

  return (
    <>
      <menu
        id={menuId}
        popover="auto"
        onToggle={(e) => setMenuOpen((e as ToggleEvent).newState === "open")}
        className={styles.dropMenu}
        style={{ positionAnchor: anchorName } as CSSProperties}
        role="menu"
      >
        <li role="none">
          <button
            type="button"
            role="menuitem"
            className={styles.dropMenuItem}
            onClick={() => {
              (document.getElementById(menuId) as any)?.hidePopover();
              onOpenSettings();
            }}
          >
            Settings
          </button>
        </li>
      </menu>
      <header className={styles.colHeader}>
        {/* TODO: once Firefox fully supports popover="hint", the onToggle + menuOpen state
          can be removed — the browser will auto-dismiss hint popovers when a popover="auto"
          opens, making the conditional Tooltip unnecessary. */}
        {menuOpen ? (
          dragButton
        ) : (
          <Tooltip text="Drag to reorder · Click for settings" position="below">
            {dragButton}
          </Tooltip>
        )}

        <div className={styles.colHeaderLeft}>
          <SvgIcon name={cfg.icon} className={styles.colIcon} />
          <Tooltip text={col.title} position="below">
            <h2>{col.title}</h2>
          </Tooltip>
          <Tooltip text={`${itemCount} ${itemLabel}`} position="below">
            <output aria-label={`${itemCount} ${itemLabel}`}>{itemCount}</output>
          </Tooltip>
        </div>
        <section className={styles.colControls}>
          {lastUpdated && (
            <Tooltip text={lastUpdated.toLocaleTimeString()} position="below">
              <span className={styles.lastUpdated}>{formatAge(lastUpdated)}</span>
            </Tooltip>
          )}
          <IconButton
            tooltip="Refresh"
            onClick={onRefresh}
            className={spinning || isFetching ? styles.btnIconSpinning : ""}
            iconName="refresh"
          />
          <IconButton tooltip="Remove column" onClick={onConfirmRemove} iconName="x" />
        </section>
      </header>
    </>
  );
};
