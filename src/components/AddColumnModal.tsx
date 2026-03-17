import { useState } from "react";
import type { ColumnType } from "@/types";
import { COLUMN_TYPES } from "@/constants";

interface AddColumnModalProps {
  onAdd: (type: ColumnType, title: string) => void;
  onClose: () => void;
}

export const AddColumnModal = ({ onAdd, onClose }: AddColumnModalProps) => {
  const [selectedType, setSelectedType] = useState<ColumnType>("prs");
  const [title, setTitle] = useState(COLUMN_TYPES[selectedType].label);

  const handleTypeChange = (type: ColumnType) => {
    setSelectedType(type);
    setTitle(COLUMN_TYPES[type].label);
  };

  const handleAdd = () => {
    onAdd(selectedType, title);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Column</h2>
        </div>
        <div className="modal-body">
          <div className="modal-types">
            {(Object.keys(COLUMN_TYPES) as ColumnType[]).map((type) => {
              const cfg = COLUMN_TYPES[type];
              return (
                <button
                  key={type}
                  className={`type-btn ${selectedType === type ? "active" : ""}`}
                  onClick={() => handleTypeChange(type)}
                >
                  <span style={{ fontSize: "14px", color: cfg.color }}>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
          <div className="modal-field">
            <label className="modal-field-label">Column Title</label>
            <input
              className="field-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-modal" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-modal btn-modal-primary" onClick={handleAdd}>
            Add Column
          </button>
        </div>
      </div>
    </div>
  );
};
