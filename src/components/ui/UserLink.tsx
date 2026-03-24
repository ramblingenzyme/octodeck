interface UserLinkProps {
  username: string | null;
}

export const UserLink = ({ username }: UserLinkProps) => {
  if (!username) return null;
  return (
    <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer">
      @{username}
    </a>
  );
};
