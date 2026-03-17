interface TopbarProps {
  onAddColumn: () => void;
}

export const Topbar = ({ onAddColumn }: TopbarProps) => {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">HubDeck</div>
        <div className="topbar-status">
          <div className="status-dot" />
          <span>connected · mock data</span>
        </div>
      </div>
      <button className="btn" onClick={onAddColumn} style={{ fontSize: "12px" }}>
        + Add Column
      </button>
    </div>
  );
};
