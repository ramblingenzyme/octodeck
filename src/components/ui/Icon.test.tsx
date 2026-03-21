import { describe, it, expect } from "vitest";
import { render } from "@testing-library/preact";
import { Icon } from "./Icon";

describe("Icon", () => {
  it("renders children inside a span", () => {
    const { container } = render(<Icon>★</Icon>);
    const span = container.querySelector("span");
    expect(span).toBeTruthy();
    expect(span!.textContent).toBe("★");
  });

  it("sets aria-hidden to true", () => {
    const { container } = render(<Icon>★</Icon>);
    expect(container.querySelector("span")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("without className: does not append extra class", () => {
    const { container } = render(<Icon>★</Icon>);
    const cls = container.querySelector("span")!.className;
    // Should not have a trailing space or extra words
    expect(cls).not.toMatch(/ $/);
  });

  it("with className: appends it to the span", () => {
    const { container } = render(<Icon className="extra-class">★</Icon>);
    expect(container.querySelector("span")!.className).toContain("extra-class");
  });
});
