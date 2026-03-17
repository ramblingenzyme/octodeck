import type { NotifItem } from "@/types";
import { NOTIF_ICONS } from "@/constants";

interface NotifCardProps {
  item: NotifItem;
}

export const NotifCard = ({ item }: NotifCardProps) => {
  const icon = NOTIF_ICONS[item.type];

  return (
    <div className="card">
      <div className="card-top">
        <span className="card-repo">{item.repo}</span>
        <span className="card-age">{item.age}</span>
      </div>
      <div className="card-title">
        <span className="notif-icon">{icon}</span>
        {item.text}
      </div>
      <span className="notif-ref">{item.ref}</span>
    </div>
  );
};
