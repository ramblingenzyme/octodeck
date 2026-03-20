interface Props {
  className?: string;
}
export const GitBranchIcon = ({ className }: Props) => (
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
    <circle cx="4" cy="4" r="2" />
    <circle cx="4" cy="12" r="2" />
    <circle cx="12" cy="4" r="2" />
    <line x1="4" y1="6" x2="4" y2="10" />
    <path d="M6 4 C9 4 10 6 10 4" />
  </svg>
);
