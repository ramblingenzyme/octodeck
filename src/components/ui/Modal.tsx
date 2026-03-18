import { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  titleId: string;
  onClose: () => void;
  onBackdropClick?: () => void;
  preventCancel?: boolean;
  children: React.ReactNode;
}

export const Modal = ({
  title,
  titleId,
  onClose,
  onBackdropClick,
  preventCancel,
  children,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onCancel={preventCancel ? (e) => e.preventDefault() : undefined}
      onClick={onBackdropClick ? (e) => { if (e.target === e.currentTarget) onBackdropClick(); } : undefined}
      aria-labelledby={titleId}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 id={titleId} className={styles.modalTitle}>
            {title}
          </h2>
        </div>
        {children}
      </div>
    </dialog>
  );
};

export const ModalBody = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.modalBody}>{children}</div>
);

export const ModalFooter = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.modalFooter}>{children}</div>
);

export { styles as modalStyles };
