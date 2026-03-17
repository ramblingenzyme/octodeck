import type { ActivityItem } from "@/types";
import { ACTIVITY_ICONS } from "@/constants";

interface ActivityCardProps {
  item: ActivityItem;
}

export const ActivityCard = ({ item }: ActivityCardProps) => {
  const icon = ACTIVITY_ICONS[item.type];

  return (
    <div className="card">
      <div className="card-top">
        <span className="card-repo">{item.repo}</span>
        <span className="card-age">{item.age}</span>
      </div>
      <div className="card-title">
        <span className="activity-icon">{icon}</span>
        {item.text}
      </div>
      {item.sha && <span className="activity-sha">{item.sha}</span>}
    </div>
  );
};
