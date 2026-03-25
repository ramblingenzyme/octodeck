import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/preact";
import { ReleaseCard } from "@/components/cards/ReleaseCard";
import type { ReleaseItem } from "@/types";

afterEach(cleanup);

const makeRelease = (overrides: Partial<ReleaseItem> = {}): ReleaseItem => ({
  type: "release",
  id: 1,
  repo: "acme/api",
  tag: "v2.4.1",
  name: "v2.4.1 — Hotfix: rate limiter",
  prerelease: false,
  age: new Date(Date.now() - 86_400_000).toISOString(),
  url: "https://github.com/acme/api/releases/tag/v2.4.1",
  ...overrides,
});

describe("ReleaseCard", () => {
  it("renders the tag as a link", () => {
    render(<ReleaseCard item={makeRelease()} />);
    const link = screen.getByRole("link", { name: /v2\.4\.1/i });
    expect(link.getAttribute("href")).toBe("https://github.com/acme/api/releases/tag/v2.4.1");
  });

  it("shows stripped subtitle when name starts with tag", () => {
    render(
      <ReleaseCard item={makeRelease({ tag: "v2.4.1", name: "v2.4.1 — Hotfix: rate limiter" })} />,
    );
    screen.getByText("Hotfix: rate limiter");
  });

  it("does not show subtitle when name equals the tag", () => {
    render(<ReleaseCard item={makeRelease({ tag: "v2.4.1", name: "v2.4.1" })} />);
    expect(screen.queryByText("v2.4.1", { selector: "span" })).toBeNull();
  });

  it("shows subtitle when name does not start with tag", () => {
    render(<ReleaseCard item={makeRelease({ tag: "v2.4.1", name: "Hotfix release" })} />);
    screen.getByText("Hotfix release");
  });

  it("renders as an article card", () => {
    render(<ReleaseCard item={makeRelease()} />);
    screen.getByRole("article");
  });

  it("renders pre-release correctly", () => {
    render(
      <ReleaseCard
        item={makeRelease({
          tag: "v3.0.0-rc.1",
          name: "v3.0.0 Release Candidate 1",
          prerelease: true,
        })}
      />,
    );
    screen.getByRole("link", { name: /v3\.0\.0-rc\.1/i });
  });
});
