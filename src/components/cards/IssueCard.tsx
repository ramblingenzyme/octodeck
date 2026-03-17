import type { IssueItem } from "@/types";
import { LABEL_COLORS, LABEL_FALLBACK } from "@/constants";

interface IssueCardProps {
  item: IssueItem;
}

export const IssueCard = ({ item }: IssueCardProps) => {
  return (
    <div className="card">
      <div className="card-top">
        <span className="card-repo">{item.repo}</span>
        <span className="card-age">{item.age}</span>
      </div>
      <div className="card-title">
        #{item.number} {item.title}
      </div>
      <div className="card-meta">
        <span className="card-author">{item.assignee ? `→ ${item.assignee}` : "unassigned"}</span>
        <span className="card-stat" style={{ color: "#6b7280" }}>
          💬{item.comments}
        </span>
      </div>
      {item.labels.length > 0 && (
        <div className="label-list">
          {item.labels.map((l) => {
            const colors = LABEL_COLORS[l] ?? LABEL_FALLBACK;
            return (
              <span key={l} className="label" style={{ background: colors.bg, color: colors.text }}>
                {l}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
