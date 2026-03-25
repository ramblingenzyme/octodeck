import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/preact";
import { ReleasesColumn } from "@/components/columns/ReleasesColumn";
import type { ColumnConfig } from "@/types";

afterEach(cleanup);

const col = (overrides: Partial<ColumnConfig> = {}): ColumnConfig => ({
  id: "col-releases",
  type: "releases",
  title: "Releases",
  ...overrides,
});

describe("ReleasesColumn", () => {
  it("renders release cards from demo data", async () => {
    render(<ReleasesColumn col={col({ repos: ["acme/api"] })} onRemove={() => {}} />);
    const cards = await screen.findAllByRole("article");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("renders without repos configured", async () => {
    render(<ReleasesColumn col={col()} onRemove={() => {}} />);
    const cards = await screen.findAllByRole("article");
    expect(cards.length).toBeGreaterThan(0);
  });
});
