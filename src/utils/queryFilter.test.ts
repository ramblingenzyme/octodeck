import { describe, it, expect } from "vitest";
import { parseQuery, matchesTokens } from "./queryFilter";
import type { PRItem, IssueItem, CIItem } from "@/types";

const basePR: PRItem = {
  id: 1,
  title: "Add feature",
  repo: "acme/api",
  author: "alice",
  number: 42,
  reviews: { approved: 1, requested: 0 },
  comments: 2,
  draft: false,
  age: "1h",
  labels: [
    { name: "bug", color: "d73a4a" },
    { name: "urgent", color: "fca5a5" },
  ],
  url: "https://github.com/acme/api/pull/42",
};

const baseIssue: IssueItem = {
  id: 2,
  title: "Fix crash",
  repo: "acme/web",
  number: 7,
  labels: [{ name: "bug", color: "d73a4a" }],
  assignee: "bob",
  comments: 0,
  age: "2d",
  state: "open",
  url: "https://github.com/acme/web/issues/7",
};

const baseCI: CIItem = {
  id: 3,
  name: "CI",
  repo: "acme/api",
  branch: "main",
  status: "success",
  duration: "1m",
  age: "30m",
  triggered: "push",
  url: "https://github.com/acme/api/actions/runs/3",
};

function tokens(query: string) {
  return parseQuery(query);
}

function matches(item: Parameters<typeof matchesTokens>[0], query: string) {
  return matchesTokens(item, tokens(query));
}

// ─── Bug 3: unknown filter keys must not silently pass ───────────────────────

describe("matchesTokens — unknown filter keys return false (bug fix)", () => {
  it("typo authr: does not match everything", () => {
    expect(matches(basePR, "authr:alice")).toBe(false);
  });

  it("stat: (not status:) does not match everything", () => {
    expect(matches(baseCI, "stat:success")).toBe(false);
  });

  it("unknown key with a non-matching value still returns false", () => {
    expect(matches(basePR, "xyz:whatever")).toBe(false);
  });

  it("unknown key does not override a valid token that would fail", () => {
    // repo:acme/api matches, xyz:foo should cause the whole query to fail
    expect(matches(basePR, "repo:acme/api xyz:foo")).toBe(false);
  });
});

// ─── Known filter keys still work ────────────────────────────────────────────

describe("matchesTokens — repo:", () => {
  it("matches exact repo", () => expect(matches(basePR, "repo:acme/api")).toBe(true));
  it("no match on different repo", () => expect(matches(basePR, "repo:acme/web")).toBe(false));
});

describe("matchesTokens — author:", () => {
  it("matches author", () => expect(matches(basePR, "author:alice")).toBe(true));
  it("no match on different author", () => expect(matches(basePR, "author:bob")).toBe(false));
  it("no match on item without author field", () =>
    expect(matches(baseIssue, "author:alice")).toBe(false));
});

describe("matchesTokens — assignee:", () => {
  it("matches assignee", () => expect(matches(baseIssue, "assignee:bob")).toBe(true));
  it("no match on item without assignee", () =>
    expect(matches(basePR, "assignee:bob")).toBe(false));
});

describe("matchesTokens — label:", () => {
  it("matches label present on item", () => expect(matches(basePR, "label:bug")).toBe(true));
  it("no match for absent label", () => expect(matches(basePR, "label:enhancement")).toBe(false));
});

describe("matchesTokens — is:", () => {
  it("is:draft matches draft PR", () =>
    expect(matches({ ...basePR, draft: true }, "is:draft")).toBe(true));
  it("is:draft does not match non-draft", () => expect(matches(basePR, "is:draft")).toBe(false));
  it("is:open matches open issue", () => expect(matches(baseIssue, "is:open")).toBe(true));
  it("is:closed matches closed issue", () =>
    expect(matches({ ...baseIssue, state: "closed" }, "is:closed")).toBe(true));
});

describe("matchesTokens — status:", () => {
  it("matches CI status", () => expect(matches(baseCI, "status:success")).toBe(true));
  it("no match on wrong status", () => expect(matches(baseCI, "status:failure")).toBe(false));
});

describe("matchesTokens — bare text search", () => {
  it("matches title substring", () => expect(matches(basePR, "feature")).toBe(true));
  it("no match for absent text", () => expect(matches(basePR, "unrelated")).toBe(false));
});

describe("matchesTokens — multiple tokens (AND logic)", () => {
  it("all tokens must match", () =>
    expect(matches(basePR, "repo:acme/api author:alice")).toBe(true));
  it("fails when any token does not match", () =>
    expect(matches(basePR, "repo:acme/api author:bob")).toBe(false));
});

describe("matchesTokens — empty query", () => {
  it("empty token list matches everything", () => {
    expect(matchesTokens(basePR, [])).toBe(true);
    expect(matchesTokens(baseIssue, [])).toBe(true);
  });
});
