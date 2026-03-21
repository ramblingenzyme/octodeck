import { useId, useRef, useState, useEffect } from "preact/hooks";
import styles from "./RepoChipList.module.css";

interface RepoChipListProps {
  repos: string[];
  suggestions?: string[];
  onAdd: (repo: string) => void;
  onRemove: (repo: string) => void;
}

export const RepoChipList = ({ repos, suggestions = [], onAdd, onRemove }: RepoChipListProps) => {
  const id = useId();
  const anchorName = `--repo-input-${id.replace(/:/g, "")}`;
  const menuId = `repo-menu-${id.replace(/:/g, "")}`;
  const menuRef = useRef<HTMLMenuElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState("");

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(filter.toLowerCase()) && !repos.includes(s),
  );

  const showMenu = () => (menuRef.current as any)?.showPopover?.();
  const hideMenu = () => (menuRef.current as any)?.hidePopover?.();

  // Close when clicking outside both the input and the menu
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        hideMenu();
      }
    };
    // Intercept Escape in capture phase before the dialog's native cancel handler fires
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuRef.current?.matches(":popover-open")) {
        e.stopPropagation();
        e.preventDefault();
        hideMenu();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  // Show/hide based on filter + available suggestions
  useEffect(() => {
    if (filtered.length > 0) {
      showMenu();
    } else {
      hideMenu();
    }
  }, [filter, filtered.length]);

  const handleInput = (e: Event) => {
    setFilter((e.target as HTMLInputElement).value);
  };

  const handleFocus = () => {
    if (filtered.length > 0) showMenu();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      (menuRef.current?.querySelector("button") as HTMLElement)?.focus();
      return;
    }
    if (e.key !== "Enter") return;
    e.preventDefault();
    const input = e.target as HTMLInputElement;
    const value = input.value.trim();
    if (value.includes("/") && !repos.includes(value)) {
      onAdd(value);
      input.value = "";
      setFilter("");
    }
  };

  const selectRepo = (repo: string) => {
    onAdd(repo);
    setFilter("");
    if (inputRef.current) inputRef.current.value = "";
    hideMenu();
    inputRef.current?.focus();
  };

  const handleOptionKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      (
        (e.currentTarget as HTMLElement).parentElement?.nextElementSibling?.querySelector(
          "button",
        ) as HTMLElement
      )?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (
        e.currentTarget as HTMLElement
      ).parentElement?.previousElementSibling?.querySelector("button") as HTMLElement | null;
      if (prev) prev.focus();
      else inputRef.current?.focus();
    }
  };

  return (
    <>
      <div className={styles.chipArea} role="group" style={{ anchorName } as React.CSSProperties}>
        <ul className={styles.chipList} aria-label="Repositories">
          {repos.map((repo) => (
            <li key={repo} className={styles.chip}>
              <span>{repo}</span>
              <button
                type="button"
                className={styles.chipRemove}
                aria-label={`Remove ${repo}`}
                onClick={() => onRemove(repo)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onFocus={handleFocus}
          placeholder={repos.length === 0 ? "owner/repo" : "Add another…"}
          aria-label="Add repository"
          aria-autocomplete="list"
          aria-controls={menuId}
        />
      </div>
      <menu
        ref={menuRef}
        id={menuId}
        popover="manual"
        className={styles.suggestions}
        style={{ positionAnchor: anchorName } as React.CSSProperties}
        role="listbox"
      >
        {filtered.map((s) => (
          <li key={s} role="none">
            <button
              type="button"
              role="option"
              className={styles.suggestion}
              onClick={() => selectRepo(s)}
              onKeyDown={handleOptionKeyDown}
            >
              {s}
            </button>
          </li>
        ))}
      </menu>
    </>
  );
};
