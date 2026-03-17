import styles from './Icon.module.css';

interface IconProps {
  children: React.ReactNode;
  className?: string;
}

export const Icon = ({ children, className }: IconProps) => (
  <span className={`${styles.icon}${className ? ` ${className}` : ''}`} aria-hidden="true">{children}</span>
);
