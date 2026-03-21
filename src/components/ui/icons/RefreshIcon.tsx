interface Props {
  className?: string;
}
export const RefreshIcon = ({ className }: Props) => (
  <svg
    className={className}
    aria-hidden="true"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M 8 2.5 A 5.5 5.5 0 1 1 3.24 5.25" />
    <path d="M 6 2.5 L 8 2.5 L 8 4.5" />
  </svg>
);
