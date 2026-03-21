interface Props {
  className?: string;
}
export const ShieldIcon = ({ className }: Props) => (
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
    <path d="M8 1.5L14 4V9c0 3.5-3 5.5-6 6.5C5 14.5 2 12.5 2 9V4L8 1.5Z" />
    <path d="M8 6v2.5" strokeWidth="2" />
    <circle cx="8" cy="11" r=".75" fill="currentColor" stroke="none" />
  </svg>
);
