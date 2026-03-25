interface OctodeckLogoProps {
  size?: number;
}

export const OctodeckLogo = ({ size = 28 }: OctodeckLogoProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Head */}
    <circle cx="16" cy="13" r="8" fill="currentColor" />
    {/* Eyes */}
    <circle cx="13" cy="12" r="1.5" fill="var(--bg-topbar)" />
    <circle cx="19" cy="12" r="1.5" fill="var(--bg-topbar)" />
    {/* Tentacles — 4 filled legs */}
    <path d="M9 19 Q5 22 5 26 Q5.5 28 7.5 27 Q9.5 25 12 21 Z" fill="currentColor" />
    <path d="M13 21 Q11 25 10 29 Q10.5 30.5 12.5 30 Q14 29 15 24 Z" fill="currentColor" />
    <path d="M19 21 Q21 25 22 29 Q21.5 30.5 19.5 30 Q18 29 17 24 Z" fill="currentColor" />
    <path d="M23 19 Q27 22 27 26 Q26.5 28 24.5 27 Q22.5 25 20 21 Z" fill="currentColor" />
  </svg>
);
