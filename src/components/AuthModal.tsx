import { useEffect, useState } from 'react';
import { useDeviceFlow } from '@/auth/useDeviceFlow';
import { useAppDispatch } from '@/store';
import { clearError } from '@/store/authSlice';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  onDemoMode: () => void;
  onClose: () => void;
}

export const AuthModal = ({ onDemoMode, onClose }: AuthModalProps) => {
  const dispatch = useAppDispatch();
  const { userCode, verificationUri, expiresAt, status, error, start } = useDeviceFlow();
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (status === 'authed') onClose();
  }, [status, onClose]);

  useEffect(() => {
    if (!expiresAt) return;
    const update = () => setSecondsLeft(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status === 'idle') onDemoMode();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [status, onDemoMode]);

  const handleCancel = () => {
    dispatch(clearError());
    onDemoMode();
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 id="auth-modal-title" className={styles.modalTitle}>Sign In</h2>
        </div>

        <div className={styles.modalBody}>
          {(status === 'idle' || status === 'error') && (
            <>
              {status === 'error' && error && (
                <p className={styles.errorText}>{error}</p>
              )}
              <p className={styles.description}>
                Connect to GitHub to load your real pull requests, issues, notifications, and activity.
              </p>
              <button className={styles.btnGitHub} onClick={status === 'error' ? () => { dispatch(clearError()); void start(); } : () => void start()}>
                Sign in with GitHub
              </button>
              <button className={styles.demoLink} onClick={onDemoMode}>
                Continue in Demo Mode
              </button>
            </>
          )}

          {status === 'polling' && userCode && (
            <>
              <p className={styles.description}>
                Visit{' '}
                <a href={verificationUri ?? 'https://github.com/login/device'} target="_blank" rel="noreferrer" className={styles.verifyLink}>
                  github.com/login/device
                </a>{' '}
                and enter this code:
              </p>
              <div className={styles.userCodeBox}>{userCode}</div>
              {secondsLeft > 0 && (
                <p className={styles.countdown}>Expires in {secondsLeft}s</p>
              )}
              <button className={styles.btnCancel} onClick={handleCancel}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
