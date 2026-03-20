interface Props {
  className?: string;
}
export const StarIcon = ({ className }: Props) => (
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
    <polygon points="8,1.5 10,6 14.5,6 11,9 12.5,13.5 8,11 3.5,13.5 5,9 1.5,6 6,6" />
  </svg>
);
