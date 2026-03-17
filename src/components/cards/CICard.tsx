import type { CIItem } from "@/types";
import { CI_STATUS } from "@/constants";

interface CICardProps {
  item: CIItem;
}

export const CICard = ({ item }: CICardProps) => {
  const status = CI_STATUS[item.status];

  return (
    <div className="card ci-card" style={{ "--ci-color": status.color } as React.CSSProperties}>
      <div className="card-top">
        <span className="card-repo">{item.repo}</span>
        <span className="card-age">{item.age}</span>
      </div>
      <div className="card-title">{item.name}</div>
      <div className="card-meta">
        <span className="card-author">{item.branch}</span>
        <span className="card-stat" style={{ color: "#6b7280" }}>
          {item.duration}
        </span>
      </div>
      <div style={{ marginTop: "6px" }}>
        <span className="ci-badge" style={{ background: status.bg, color: status.color }}>
          {status.icon} {status.label}
        </span>
      </div>
    </div>
  );
};
