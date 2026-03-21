import { describe, it, expect } from "vitest";
import { getItemDisplayText } from "./getItemDisplayText";
import type { PRItem, IssueItem, CIItem, NotifItem, ActivityItem } from "@/types";

const prItem: PRItem = {
  id: 1,
  title: "Add new feature",
  repo: "org/repo",
  author: "alice",
  number: 42,
  reviews: { approved: 1, requested: 0 },
  comments: 3,
  draft: false,
  age: "2h",
  labels: [],
  url: "https://github.com/org/repo/pull/42",
};

const issueItem: IssueItem = {
  id: 2,
  title: "Fix the bug",
  repo: "org/repo",
  number: 7,
  labels: [],
  assignee: null,
  comments: 1,
  age: "1d",
  state: "open",
  url: "https://github.com/org/repo/issues/7",
};

const ciItem: CIItem = {
  id: 3,
  name: "CI / build",
  repo: "org/repo",
  branch: "main",
  status: "success",
  duration: "2m",
  age: "30m",
  triggered: "push",
  url: "https://github.com/org/repo/actions/runs/3",
};

const notifItem: NotifItem = {
  id: 4,
  type: "mention",
  text: "You were mentioned in a comment",
  repo: "org/repo",
  ref: "PR #42",
  age: "5m",
  url: "https://github.com/org/repo/pull/42",
};

const activityItem: ActivityItem = {
  id: 5,
  type: "commit",
  text: "alice pushed 2 commits to main",
  repo: "org/repo",
  age: "1h",
  url: "https://github.com/org/repo/commits/main",
};

describe("getItemDisplayText", () => {
  it("returns title for PRItem", () => {
    expect(getItemDisplayText(prItem)).toBe("Add new feature");
  });

  it("returns title for IssueItem", () => {
    expect(getItemDisplayText(issueItem)).toBe("Fix the bug");
  });

  it("returns name for CIItem (has name, no title)", () => {
    expect(getItemDisplayText(ciItem)).toBe("CI / build");
  });

  it("returns text for NotifItem", () => {
    expect(getItemDisplayText(notifItem)).toBe("You were mentioned in a comment");
  });

  it("returns text for ActivityItem", () => {
    expect(getItemDisplayText(activityItem)).toBe("alice pushed 2 commits to main");
  });
});
