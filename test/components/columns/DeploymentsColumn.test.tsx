import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/preact";
import { DeploymentsColumn } from "@/components/columns/DeploymentsColumn";
import type { ColumnConfig } from "@/types";

afterEach(cleanup);

const col = (overrides: Partial<ColumnConfig> = {}): ColumnConfig => ({
  id: "col-deployments",
  type: "deployments",
  title: "Deployments",
  ...overrides,
});

describe("DeploymentsColumn", () => {
  it("renders deployment cards from demo data", async () => {
    render(<DeploymentsColumn col={col({ repos: ["acme/api"] })} onRemove={() => {}} />);
    const cards = await screen.findAllByRole("article");
    expect(cards.length).toBeGreaterThan(0);
  });
});
