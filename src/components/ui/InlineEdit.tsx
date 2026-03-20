import { useLayoutEffect, useRef, useState } from "preact/hooks";
import { PencilIcon } from "./PencilIcon";
import { Icon } from "./Icon";
import styles from "./InlineEdit.module.css";

interface InlineEditProps {
  value: string;
  onCommit: (value: string) => void;
  "aria-label"?: string;
}

export const InlineEdit = ({ value, onCommit, "aria-label": ariaLabel }: InlineEditProps) => {
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (editing) {
      textareaRef.current?.focus();
    }
  }, [editing]);

  const startEdit = () => {
    setEditing(true);
  };

  const commit = () => {
    onCommit(textareaRef.current!.value.trim());
    setEditing(false);
  };

  const cancel = () => {
    textareaRef.current!.value = value;
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={styles.editRow}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          defaultValue={value}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
          }}
          onKeyUp={(e) => {
            if (e.key === "Escape") cancel();
          }}
          aria-label={ariaLabel}
        />
        <button className={styles.confirm} onClick={commit} aria-label="Confirm">
          ✓
        </button>
        <button className={styles.cancel} onClick={cancel} aria-label="Cancel">
          <Icon>✕</Icon>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={styles.display}
      onClick={startEdit}
      aria-label={ariaLabel ? `Edit ${ariaLabel}` : undefined}
      title={value}
    >
      {value}
      <PencilIcon className={styles.pencil} />
    </button>
  );
};
