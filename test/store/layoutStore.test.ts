import { describe, it, expect, beforeEach } from "vitest";
import { useLayoutStore } from "@/store/layoutStore";
import { DEFAULT_COLUMNS } from "@/constants";

beforeEach(() => {
  useLayoutStore.setState({ columns: DEFAULT_COLUMNS });
});

describe("useLayoutStore.reorder", () => {
  it("moves a column from one index to another", () => {
    const before = useLayoutStore.getState().columns;
    const firstId = before[0]!.id;
    const secondId = before[1]!.id;

    useLayoutStore.getState().reorder(0, 1);

    const after = useLayoutStore.getState().columns;
    expect(after[1]!.id).toBe(firstId);
    expect(after[0]!.id).toBe(secondId);
  });
});
