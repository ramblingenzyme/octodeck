import { useCallback, useEffect, useRef, useState } from "preact/hooks";

const MIN_SPIN_MS = 800;

export function useRefreshSpinner(isFetching: boolean, refetch: () => void) {
  const [spinning, setSpinning] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const prevFetching = useRef(false);
  const spinStartedAt = useRef<number | null>(null);

  useEffect(() => {
    if (isFetching && !prevFetching.current) {
      // A fetch just started (could be manual or background poll).
      // If handleRefresh already set spinning, preserve it; otherwise ignore.
    }
    if (prevFetching.current && !isFetching) {
      setLastUpdated(new Date());
      // Respect the minimum display time so the spinner doesn't flash.
      const elapsed =
        spinStartedAt.current != null ? Date.now() - spinStartedAt.current : MIN_SPIN_MS;
      const remaining = Math.max(0, MIN_SPIN_MS - elapsed);
      setTimeout(() => setSpinning(false), remaining);
      spinStartedAt.current = null;
    }
    prevFetching.current = isFetching;
  }, [isFetching]);

  const handleRefresh = useCallback(() => {
    refetch();
    setSpinning(true);
    spinStartedAt.current = Date.now();
  }, [refetch]);

  return { spinning, lastUpdated, handleRefresh };
}
