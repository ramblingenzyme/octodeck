interface Props {
  className?: string;
}
export const GitForkIcon = ({ className }: Props) => (
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
    <circle cx="5" cy="3" r="1.5" />
    <circle cx="11" cy="3" r="1.5" />
    <circle cx="8" cy="13" r="1.5" />
    <line x1="5" y1="4.5" x2="5" y2="7" />
    <line x1="11" y1="4.5" x2="11" y2="7" />
    <path d="M5 7 Q5 9 8 9 Q11 9 11 7" />
    <line x1="8" y1="9" x2="8" y2="11.5" />
  </svg>
);
