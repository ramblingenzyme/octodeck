import styles from "./RepoChipList.module.css";

interface RepoChipListProps {
  repos: string[];
  onAdd: (repo: string) => void;
  onRemove: (repo: string) => void;
}

export const RepoChipList = ({ repos, onAdd, onRemove }: RepoChipListProps) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const input = e.target as HTMLInputElement;
    const value = input.value.trim();
    if (value.includes("/") && !repos.includes(value)) {
      onAdd(value);
      input.value = "";
    }
  };

  return (
    <div className={styles.chipArea} role="group">
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
        className={styles.input}
        type="text"
        onKeyDown={handleKeyDown}
        placeholder={repos.length === 0 ? "owner/repo" : "Add another…"}
        aria-label="Add repository"
      />
    </div>
  );
};
