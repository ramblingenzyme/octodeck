import { useAuthStore } from "@/store/authStore";
import { useGetUser } from "@/store/githubQueries";
import { isDemoMode } from "@/env";
import { OctodeckLogo } from "./OctodeckLogo";
import styles from "./Topbar.module.css";

interface TopbarProps {
  onAddColumn: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Topbar = ({ onAddColumn, onSignIn, onSignOut }: TopbarProps) => {
  const token = useAuthStore((s) => s.token);
  const status = useAuthStore((s) => s.status);
  const { data: user } = useGetUser(token);
  const authed = status === "authed" && user;

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <div className={styles.topbarLogo}>
          <OctodeckLogo size={29} />
          Octodeck
        </div>
      </div>

      <div className={styles.topbarRight}>
        <button className={styles.btnAdd} onClick={onAddColumn}>
          + Add Column
        </button>
        {authed ? (
          <>
            <button className={styles.avatarBtn} popoverTarget="user-menu" aria-label="User menu">
              <img
                className={styles.userAvatar}
                src={user.avatarUrl}
                alt={user.login}
                width={28}
                height={28}
              />
            </button>
            <div id="user-menu" popover="auto" className={styles.userMenu}>
              <span className={styles.menuLogin}>@{user.login}</span>
              <hr className={styles.menuDivider} />
              <button className={styles.menuSignOut} onClick={onSignOut}>
                Sign out
              </button>
            </div>
          </>
        ) : isDemoMode ? (
          <>
            <span className={styles.demoBadge}>Demo</span>
            <button className={styles.btnSignIn} onClick={onSignIn}>
              Sign in
            </button>
          </>
        ) : (
          <button className={styles.btnSignIn} onClick={onSignIn}>
            Sign in
          </button>
        )}
      </div>
    </header>
  );
};
