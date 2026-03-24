interface RefLinkProps {
  repo: string;
  gitRef: string;
}

export const RefLink = ({ repo, gitRef }: RefLinkProps) => (
  <a href={`https://github.com/${repo}/tree/${gitRef}`} target="_blank" rel="noreferrer">
    {gitRef}
  </a>
);
