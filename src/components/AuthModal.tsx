import { useAuthStore } from "@/store/authStore";
import { redirectToGitHub } from "@/auth/oauthFlow";
import { Modal } from "./ui/Modal";
import styles from "./AuthModal.module.css";

interface AuthModalProps {
  open: boolean;
  onDemoMode: () => void;
  onClose: () => void;
}

export const AuthModal = ({ open, onDemoMode, onClose }: AuthModalProps) => {
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const handleSignIn = () => {
    clearError();
    redirectToGitHub();
  };

  return (
    <Modal open={open} title="Sign In" titleId="auth-modal-title" onClose={onClose} preventCancel>
      <div className={styles.modalBody}>
        {status === "error" && error && <p className={styles.errorText}>{error}</p>}
        <p className={styles.description}>
          Connect to GitHub to load your real pull requests, issues, notifications, and activity.
        </p>
        <button className={styles.btnGitHub} onClick={handleSignIn}>
          Sign in with GitHub
        </button>
        <button className={styles.demoLink} onClick={onDemoMode}>
          Continue in Demo Mode
        </button>
      </div>
    </Modal>
  );
};
