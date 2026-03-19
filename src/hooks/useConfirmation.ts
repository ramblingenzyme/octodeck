import { useState } from "preact/hooks";

export function useConfirmation() {
  const [isConfirming, setIsConfirming] = useState(false);
  return {
    isConfirming,
    startConfirm: () => setIsConfirming(true),
    cancelConfirm: () => setIsConfirming(false),
  };
}
