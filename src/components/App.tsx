import { useEffect, useState } from 'react';
import type { ColumnType } from '@/types';
import {
  useGetLayoutQuery,
  useAddColumnMutation,
  useRemoveColumnMutation,
  useMoveLeftMutation,
  useMoveRightMutation,
} from '@/store/configApi';
import { useAppDispatch, useAppSelector } from '@/store';
import { logOut, userLoaded } from '@/store/authSlice';
import { useGetUserQuery } from '@/store/githubApi';
import { isDemoMode } from '@/env';
import { Topbar } from './Topbar';
import { Board } from './Board';
import { AddColumnModal } from './AddColumnModal';
import { AuthModal } from './AuthModal';

export const App = () => {
  const { data: columns = [] } = useGetLayoutQuery();
  const [addColumn] = useAddColumnMutation();
  const [removeColumn] = useRemoveColumnMutation();
  const [moveLeft] = useMoveLeftMutation();
  const [moveRight] = useMoveRightMutation();
  const [showModal, setShowModal] = useState(false);

  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const [showAuthModal, setShowAuthModal] = useState(
    !isDemoMode && auth.status === 'idle',
  );

  // Fetch user profile when token is available
  const { data: userData } = useGetUserQuery(undefined, {
    skip: !auth.token || !!auth.user,
  });

  useEffect(() => {
    if (userData) dispatch(userLoaded(userData));
  }, [userData, dispatch]);

  // Close auth modal when authed
  useEffect(() => {
    if (auth.status === 'authed') setShowAuthModal(false);
  }, [auth.status]);

  const handleAddColumn = (type: ColumnType, title: string, repos?: string[]) => {
    addColumn({ type, title, repos });
    setShowModal(false);
  };

  const handleSignOut = () => {
    dispatch(logOut());
    setShowAuthModal(true);
  };

  return (
    <>
      <Topbar
        onAddColumn={() => setShowModal(true)}
        onSignIn={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
      />
      <Board
        columns={columns}
        onAddColumn={() => setShowModal(true)}
        onRemove={(id) => removeColumn(id)}
        onMoveLeft={(id) => moveLeft(id)}
        onMoveRight={(id) => moveRight(id)}
      />
      {showModal && (
        <AddColumnModal onAdd={handleAddColumn} onClose={() => setShowModal(false)} />
      )}
      {showAuthModal && (
        <AuthModal
          onDemoMode={() => setShowAuthModal(false)}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
};
