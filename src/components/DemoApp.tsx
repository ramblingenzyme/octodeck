import { useEffect } from "preact/hooks";
import { useModal } from "@/hooks/useModal";
import type { ColumnType } from "@/types";
import { useLayoutStore } from "@/store/layoutStore";
import { DEMO_COLUMNS } from "@/constants";
import { Topbar } from "./Topbar";
import { Board } from "./Board";
import { AddColumnModal } from "./AddColumnModal";
import { DemoColumn } from "@/demo/DemoColumn";

export const DemoApp = () => {
  useEffect(() => {
    useLayoutStore.setState({ columns: DEMO_COLUMNS });
  }, []);

  const columns = useLayoutStore((s) => s.columns);
  const addColumn = useLayoutStore((s) => s.addColumn);
  const removeColumn = useLayoutStore((s) => s.removeColumn);
  const addColumnModal = useModal();

  const handleAddColumn = (type: ColumnType, title: string, query?: string, repos?: string[]) => {
    addColumn(type, title, query, repos);
    addColumnModal.close();
  };

  return (
    <>
      <Topbar
        onAddColumn={() => addColumnModal.open()}
        onSignIn={() => {
          window.location.href = "/";
        }}
        onSignOut={() => {
          window.location.href = "/";
        }}
      />
      <Board
        columns={columns}
        onAddColumn={() => addColumnModal.open()}
        onRemove={(id) => removeColumn(id)}
        columnComponent={DemoColumn}
      />
      <AddColumnModal
        open={addColumnModal.isOpen}
        onAdd={handleAddColumn}
        onClose={() => addColumnModal.close()}
      />
    </>
  );
};
