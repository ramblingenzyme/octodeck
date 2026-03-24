import type { PRItem, IssueItem, CIItem, KnownItem } from "@/types";
import { getItemDisplayText } from "@/utils/getItemDisplayText";

/** Parse a GitHub-style query string into key:value tokens and bare terms. */
export function parseQuery(query: string): { key: string; value: string }[] {
  return query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const colon = token.indexOf(":");
      if (colon > 0) {
        return {
          key: token.slice(0, colon).toLowerCase(),
          value: token.slice(colon + 1).toLowerCase(),
        };
      }
      return { key: "", value: token.toLowerCase() };
    });
}

// TODO: provide some UI guidance on supported tokens in column queries that are filtered client side
export function matchesTokens(item: KnownItem, tokens: ReturnType<typeof parseQuery>): boolean {
  return tokens.every(({ key, value }) => {
    if (!key) {
      return getItemDisplayText(item).toLowerCase().includes(value);
    }
    switch (key) {
      case "repo":
        return item.repo.toLowerCase() === value;
      case "author":
        return "author" in item && (item as PRItem).author.toLowerCase() === value;
      case "assignee":
        return "assignee" in item && (item as IssueItem).assignee?.toLowerCase() === value;
      case "label":
        return (
          "labels" in item &&
          (item as PRItem | IssueItem).labels.some((l) => l.name.toLowerCase() === value)
        );
      case "is":
        if (value === "draft") return "draft" in item && (item as PRItem).draft === true;
        if (value === "open") return "state" in item && (item as IssueItem).state === "open";
        if (value === "closed") return "state" in item && (item as IssueItem).state === "closed";
        if (value === "pr" || value === "pull-request") return "draft" in item;
        if (value === "issue") return "state" in item && !("draft" in item);
        return true;
      case "status":
        return "status" in item && (item as CIItem).status.toLowerCase() === value;
      case "branch":
        return "branch" in item && (item as CIItem).branch.toLowerCase().includes(value);
      default:
        return false;
    }
  });
}
