import { useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import type { ColumnType } from "@/types";
import {
  useGetLayoutQuery,
  useAddColumnMutation,
  useRemoveColumnMutation,
} from "@/store/configApi";
import { useAppDispatch, useAppSelector } from "@/store";
import { logOut } from "@/store/authSlice";
import { isDemoMode } from "@/env";
import { Topbar } from "./Topbar";
import { Board } from "./Board";
import { AddColumnModal } from "./AddColumnModal";
import { AuthModal } from "./AuthModal";

export const App = () => {
  const { data: columns = [] } = useGetLayoutQuery();
  const [addColumn] = useAddColumnMutation();
  const [removeColumn] = useRemoveColumnMutation();
  const addColumnModal = useModal();

  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const authModal = useModal(!isDemoMode && auth.status === "idle");

  // Close auth modal when authed
  const { close: closeAuthModal } = authModal;
  useEffect(() => {
    if (auth.status === "authed") closeAuthModal();
  }, [auth.status, closeAuthModal]);

  const handleAddColumn = (type: ColumnType, title: string, query?: string) => {
    addColumn({ type, title, query });
    addColumnModal.close();
  };

  const handleSignOut = () => {
    dispatch(logOut());
    authModal.open();
  };

  return (
    <>
      <Topbar
        onAddColumn={() => addColumnModal.open()}
        onSignIn={() => authModal.open()}
        onSignOut={handleSignOut}
      />
      <Board
        columns={columns}
        onAddColumn={() => addColumnModal.open()}
        onRemove={(id) => removeColumn(id)}
      />
      {addColumnModal.isOpen && <AddColumnModal onAdd={handleAddColumn} onClose={() => addColumnModal.close()} />}
      {authModal.isOpen && (
        <AuthModal
          onDemoMode={() => authModal.close()}
          onClose={() => authModal.close()}
        />
      )}
    </>
  );
};
