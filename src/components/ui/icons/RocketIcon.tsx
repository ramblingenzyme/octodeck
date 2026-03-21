interface Props {
  className?: string;
}
export const RocketIcon = ({ className }: Props) => (
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
    <path d="M8 1.5c2.5 0 5 2.5 5 6v1.5l1.5 2.5H10v1a.5.5 0 01-1 0v-1H7v1a.5.5 0 01-1 0v-1H1.5L3 9V7.5C3 4 5.5 1.5 8 1.5Z" />
    <circle cx="8" cy="7" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
