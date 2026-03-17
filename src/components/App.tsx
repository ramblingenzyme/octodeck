import { useState } from "react";
import type { ColumnType } from "@/types";
import {
  useGetLayoutQuery,
  useAddColumnMutation,
  useRemoveColumnMutation,
  useMoveLeftMutation,
  useMoveRightMutation,
} from "@/store/configApi";
import { Topbar } from "./Topbar";
import { Board } from "./Board";
import { AddColumnModal } from "./AddColumnModal";
import styles from "./App.module.css";

export const App = () => {
  const { data: columns = [] } = useGetLayoutQuery();
  const [addColumn] = useAddColumnMutation();
  const [removeColumn] = useRemoveColumnMutation();
  const [moveLeft] = useMoveLeftMutation();
  const [moveRight] = useMoveRightMutation();
  const [showModal, setShowModal] = useState(false);

  const handleAddColumn = (type: ColumnType, title: string) => {
    addColumn({ type, title });
    setShowModal(false);
  };

  return (
    <div className={styles.appRoot}>
      <Topbar onAddColumn={() => setShowModal(true)} />
      <Board
        columns={columns}
        onAddColumn={() => setShowModal(true)}
        onRemove={(id) => removeColumn(id)}
        onMoveLeft={(id) => moveLeft(id)}
        onMoveRight={(id) => moveRight(id)}
      />
      {showModal && <AddColumnModal onAdd={handleAddColumn} onClose={() => setShowModal(false)} />}
    </div>
  );
};
