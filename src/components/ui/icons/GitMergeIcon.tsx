interface Props {
  className?: string;
}
export const GitMergeIcon = ({ className }: Props) => (
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
    <circle cx="4" cy="4" r="1.75" />
    <circle cx="4" cy="12" r="1.75" />
    <circle cx="12" cy="4" r="1.75" />
    <line x1="4" y1="5.75" x2="4" y2="10.25" />
    <path d="M 4 10.25 C 4 7 12 8 12 5.75" />
  </svg>
);
