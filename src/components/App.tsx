import { useState } from "react";
import type { ColumnType } from "@/types";
import { useColumns } from "@/hooks/useColumns";
import { Topbar } from "./Topbar";
import { Board } from "./Board";
import { AddColumnModal } from "./AddColumnModal";

export const App = () => {
  const { columns, addCol, removeCol, moveLeft, moveRight } = useColumns();
  const [showModal, setShowModal] = useState(false);

  const handleAddColumn = (type: ColumnType, title: string) => {
    addCol(type, title);
    setShowModal(false);
  };

  return (
    <div className="app-root">
      <Topbar onAddColumn={() => setShowModal(true)} />
      <Board
        columns={columns}
        onAddColumn={() => setShowModal(true)}
        onRemove={removeCol}
        onMoveLeft={moveLeft}
        onMoveRight={moveRight}
      />
      {showModal && <AddColumnModal onAdd={handleAddColumn} onClose={() => setShowModal(false)} />}
    </div>
  );
};
