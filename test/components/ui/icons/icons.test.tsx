import { describe, it, expect } from "vitest";
import { render } from "@testing-library/preact";
import { GitBranchIcon } from "@/components/ui/icons/GitBranchIcon";
import { GitForkIcon } from "@/components/ui/icons/GitForkIcon";
import { StarIcon } from "@/components/ui/icons/StarIcon";

const icons = [
  { name: "GitBranchIcon", Component: GitBranchIcon },
  { name: "GitForkIcon", Component: GitForkIcon },
  { name: "StarIcon", Component: StarIcon },
] as const;

for (const { name, Component } of icons) {
  describe(name, () => {
    it("renders an SVG element", () => {
      const { container } = render(<Component />);
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("SVG has aria-hidden='true'", () => {
      const { container } = render(<Component />);
      expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    });

    it("forwards className to SVG", () => {
      const { container } = render(<Component className="w-4 h-4" />);
      expect(container.querySelector("svg")?.getAttribute("class")).toContain("w-4");
    });
  });
}
