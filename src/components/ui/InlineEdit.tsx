import { useLayoutEffect, useRef, useState } from "preact/hooks";
import { SvgIcon } from "./SvgIcon";
import styles from "./InlineEdit.module.css";

interface InlineEditProps {
  value: string;
  onCommit: (value: string) => void;
  onCancel?: () => void;
  initialEditing?: boolean;
  placeholder?: string;
  "aria-label"?: string;
}

export const InlineEdit = ({
  value,
  onCommit,
  onCancel,
  initialEditing = false,
  placeholder,
  "aria-label": ariaLabel,
}: InlineEditProps) => {
  const [editing, setEditing] = useState(initialEditing);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startEdit = () => {
    setEditing(true);
  };

  const commit = () => {
    onCommit(textareaRef.current!.value.trim());
    setEditing(false);
  };

  const cancel = () => {
    setEditing(false);
    onCancel?.();
  };

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(-1, -1);
    }
  }, [editing]);

  if (editing) {
    return (
      <div className={styles.editRow}>
        <textarea
          ref={textareaRef}
          defaultValue={value}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
          }}
          // Escape on keyup feels better than onKeyDown
          onKeyUp={(e) => {
            if (e.key === "Escape") cancel();
          }}
          aria-label={ariaLabel}
        />
        <button onClick={commit} aria-label="Confirm">
          <SvgIcon name="check" />
        </button>
        <button onClick={cancel} aria-label="Cancel">
          <SvgIcon name="x" />
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
      {value || (placeholder && <span className={styles.placeholder}>{placeholder}</span>)}
      <SvgIcon name="pencil" className={styles.pencil} />
    </button>
  );
};
