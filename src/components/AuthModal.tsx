import { useEffect } from "preact/hooks";
import { useDeviceFlow } from "@/auth/useDeviceFlow";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { useAuthStore } from "@/store/authStore";
import { Modal } from "./ui/Modal";
import styles from "./AuthModal.module.css";

interface AuthModalProps {
  open: boolean;
  onDemoMode: () => void;
  onClose: () => void;
}

export const AuthModal = ({ open, onDemoMode, onClose }: AuthModalProps) => {
  const clearError = useAuthStore((s) => s.clearError);
  const { userCode, verificationUri, expiresAt, status, error, start } = useDeviceFlow();
  const secondsLeft = useCountdownTimer(expiresAt);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status === "idle") onDemoMode();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [status, onDemoMode]);

  const handleCancel = () => {
    clearError();
    onDemoMode();
  };

  return (
    <Modal open={open} title="Sign In" titleId="auth-modal-title" onClose={onClose} preventCancel>
      <div className={styles.modalBody}>
        {(status === "idle" || status === "error") && (
          <>
            {status === "error" && error && <p className={styles.errorText}>{error}</p>}
            <p className={styles.description}>
              Connect to GitHub to load your real pull requests, issues, notifications, and
              activity.
            </p>
            <button
              className={styles.btnGitHub}
              onClick={
                status === "error"
                  ? () => {
                      clearError();
                      void start();
                    }
                  : () => void start()
              }
            >
              Sign in with GitHub
            </button>
            <button className={styles.demoLink} onClick={onDemoMode}>
              Continue in Demo Mode
            </button>
          </>
        )}

        {status === "polling" && userCode && (
          <>
            <p className={styles.description}>
              Visit{" "}
              <a
                href={verificationUri ?? "https://github.com/login/device"}
                target="_blank"
                rel="noreferrer"
                className={styles.verifyLink}
              >
                github.com/login/device
              </a>{" "}
              and enter this code:
            </p>
            <div className={styles.userCodeBox}>{userCode}</div>
            {secondsLeft > 0 && <p className={styles.countdown}>Expires in {secondsLeft}s</p>}
            <button className={styles.btnCancel} onClick={handleCancel}>
              Cancel
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};
