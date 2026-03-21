interface Props {
  className?: string;
}
export const DeployIcon = ({ className }: Props) => (
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
    {/* Server box */}
    <rect x="2" y="10" width="12" height="4.5" rx="1" />
    <circle cx="5" cy="12.25" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="7.5" cy="12.25" r="0.6" fill="currentColor" stroke="none" />
    {/* Upload arrow */}
    <path d="M8 1.5V8.5" />
    <path d="M5 4.5L8 1.5L11 4.5" />
  </svg>
);
