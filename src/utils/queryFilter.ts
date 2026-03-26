import type {
  PRItem,
  IssueItem,
  CIItem,
  ActivityItem,
  ReleaseItem,
  DeploymentItem,
  KnownItem,
} from "@/types";

/** Parse a GitHub-style query string into key:value tokens and bare terms. */
export function parseQuery(query: string): { key: string; value: string; negate: boolean }[] {
  return query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const negate = token.startsWith("-");
      const t = negate ? token.slice(1) : token;
      const colon = t.indexOf(":");
      if (colon > 0) {
        return {
          key: t.slice(0, colon).toLowerCase(),
          value: t.slice(colon + 1).toLowerCase(),
          negate,
        };
      }
      return { key: "", value: t.toLowerCase(), negate };
    });
}

export type Tokens = ReturnType<typeof parseQuery>;

export type FilterScope = "client" | "server";

export type MatchStrategy<T> =
  | { kind: "exact"; get: (item: T) => string | null | undefined }
  | { kind: "substring"; get: (item: T) => string | null | undefined }
  | { kind: "array-some"; get: (item: T) => readonly { name: string }[] }
  | { kind: "flag"; get: (item: T) => boolean; flagValue: string }
  | {
      kind: "status-enum";
      get: (item: T) => string;
      statusValues: readonly string[];
      passthroughValues?: readonly string[];
    };

/**
 * A filter definition for a query token key.
 *
 * - `scope: 'server'` — this token is handled by the GitHub API; the implicit client-side
 *   strategy passes through (returns true), trusting the server to have already filtered.
 * - `scope: 'client'` — this token is matched client-side using the required strategy.
 */
export type FilterDef<T> =
  | { description: string; scope: "server" }
  | { description: string; scope: "client"; strategy: MatchStrategy<T> };

export interface ServerFilteredInfo {
  readonly docsUrl: string;
  readonly examples: readonly { readonly key: string; readonly description: string }[];
}

export type ClientFilterMap<T> = {
  readonly name: string;
  readonly filters: Readonly<Record<string, FilterDef<T>>>;
  /** Human-readable names of the fields searched by bare text tokens (for documentation). */
  readonly textSearchFields: readonly string[];
  /** Returns fields to search across when the query has no key (bare text). */
  readonly textSearch: (item: T) => (string | null | undefined)[];
};

export type ServerFilteredMap = {
  readonly name: string;
  readonly serverFiltered: ServerFilteredInfo;
};

export type FilterMap<T> = ServerFilteredMap | ClientFilterMap<T>;

function runMatch<T>(item: T, strategy: MatchStrategy<T>, value: string): boolean {
  switch (strategy.kind) {
    case "exact":
      return strategy.get(item)?.toLowerCase() === value;
    case "substring":
      return strategy.get(item)?.toLowerCase().includes(value) ?? false;
    case "array-some":
      return strategy.get(item).some((el) => el.name.toLowerCase() === value);
    case "flag":
      return value === strategy.flagValue && strategy.get(item);
    case "status-enum":
      if (strategy.passthroughValues?.includes(value)) return true;
      return strategy.statusValues.includes(value) && strategy.get(item).toLowerCase() === value;
  }
}

function applyFilters<T>(item: T, filterMap: ClientFilterMap<T>, tokens: Tokens): boolean {
  return tokens.every(({ key, value, negate }) => {
    let result: boolean;
    if (!key) {
      result = filterMap
        .textSearch(item)
        .some((field) => field?.toLowerCase().includes(value) ?? false);
    } else {
      const def = filterMap.filters[key];
      if (!def) return false;
      if (def.scope === "server") return true; // implicit server passthrough
      result = runMatch(item, def.strategy, value);
    }
    return negate ? !result : result;
  });
}

function splitTokens<T>(
  tokens: Tokens,
  filterMap: ClientFilterMap<T>,
): { server: Tokens; client: Tokens } {
  return {
    server: tokens.filter((t) => t.key && filterMap.filters[t.key]?.scope === "server"),
    client: tokens.filter((t) => !t.key || filterMap.filters[t.key]?.scope === "client"),
  };
}

/**
 * PR columns use the GitHub Search API for all filtering — no client-side filters.
 */
const GITHUB_SEARCH_INFO: ServerFilteredInfo = {
  docsUrl:
    "https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests",
  examples: [
    { key: "involves:@me", description: "PRs/issues involving you" },
    { key: "is:open", description: "Open items" },
    { key: "is:closed", description: "Closed items" },
    { key: "author:", description: "Author username" },
    { key: "label:", description: "Label name" },
    { key: "repo:", description: "Repository (owner/name)" },
    { key: "milestone:", description: "Milestone title" },
  ],
};

export const PR_FILTERS: FilterMap<PRItem> = {
  name: "Pull Requests",
  textSearchFields: [],
  textSearch: () => [],
  filters: {},
  serverFiltered: GITHUB_SEARCH_INFO,
};

/**
 * Issue columns use the GitHub Search API for all filtering — no client-side filters.
 */
export const ISSUE_FILTERS: FilterMap<IssueItem> = {
  name: "Issues",
  textSearchFields: [],
  textSearch: () => [],
  filters: {},
  serverFiltered: GITHUB_SEARCH_INFO,
};

/**
 * Client-side strategies for filtering PR items in demo mode.
 * Only use via matchesDemoTokens — not for production code.
 */
export const DEMO_PR_FILTERS: FilterMap<PRItem> = {
  name: "Pull Requests",
  textSearchFields: ["title", "repo", "author", "assignee"],
  textSearch: (item) => [item.title, item.repo, item.author, item.assignee],
  filters: {
    repo: {
      description: "Repository",
      scope: "client",
      strategy: { kind: "exact", get: (item) => item.repo },
    },
    author: {
      description: "Author",
      scope: "client",
      strategy: { kind: "exact", get: (item) => item.author },
    },
    assignee: {
      description: "Assignee",
      scope: "client",
      strategy: { kind: "exact", get: (item) => item.assignee },
    },
    label: {
      description: "Label",
      scope: "client",
      strategy: { kind: "array-some", get: (item) => item.labels },
    },
    is: {
      description: "Status or type",
      scope: "client",
      strategy: {
        kind: "status-enum",
        get: (item) => item.status,
        statusValues: ["draft", "open", "closed", "merged"],
        passthroughValues: ["pr", "pull-request"],
      },
    },
  },
};

/**
 * Client-side strategies for filtering Issue items in demo mode.
 * Only use via matchesDemoTokens — not for production code.
 */
export const DEMO_ISSUE_FILTERS: FilterMap<IssueItem> = {
  name: "Issues",
  textSearchFields: ["title", "repo", "assignee"],
  textSearch: (item) => [item.title, item.repo, item.assignee],
  filters: {
    repo: {
      description: "Repository",
      scope: "client",
      strategy: { kind: "exact", get: (item) => item.repo },
    },
    assignee: {
      description: "Assignee",
      scope: "client",
      strategy: { kind: "exact", get: (item) => item.assignee },
    },
    label: {
      description: "Label",
      scope: "client",
      strategy: { kind: "array-some", get: (item) => item.labels },
    },
    is: {
      description: "State or type",
      scope: "client",
      strategy: {
        kind: "status-enum",
        get: (item) => item.state,
        statusValues: ["open", "closed"],
        passthroughValues: ["issue"],
      },
    },
  },
};

export const CI_FILTERS: FilterMap<CIItem> = {
  name: "CI / CD",
  textSearchFields: ["name", "repo", "branch", "status", "triggered"],
  textSearch: (item) => [item.name, item.repo, item.branch, item.status, item.triggered],
  filters: {
    repo: {
      description: "Repository",
      scope: "client",
      strategy: { kind: "exact", get: (item) => item.repo },
    },
    status: {
      description: "Run status",
      scope: "client",
      strategy: { kind: "exact", get: (item) => item.status },
    },
    branch: { description: "Branch", scope: "server" },
    triggered: { description: "Trigger event", scope: "server" },
    actor: { description: "Actor", scope: "server" },
  },
};

export const ACTIVITY_FILTERS: FilterMap<ActivityItem> = {
  name: "Activity",
  textSearchFields: ["text", "repo", "kind", "ref"],
  textSearch: (item) => [item.text, item.repo, item.kind, item.ref],
  filters: {
    repo: {
      description: "Repository",
      scope: "client",
      strategy: { kind: "exact", get: (item) => item.repo },
    },
    ref: {
      description: "Ref",
      scope: "client",
      strategy: { kind: "substring", get: (item) => item.ref },
    },
    type: {
      description: "Activity type",
      scope: "client",
      strategy: { kind: "exact", get: (item) => item.kind },
    },
  },
};

export const RELEASE_FILTERS: FilterMap<ReleaseItem> = {
  name: "Releases",
  textSearchFields: ["name", "tag", "repo"],
  textSearch: (item) => [item.name, item.tag, item.repo],
  filters: {
    repo: {
      description: "Repository",
      scope: "client",
      strategy: { kind: "exact", get: (item) => item.repo },
    },
    tag: {
      description: "Tag",
      scope: "client",
      strategy: { kind: "exact", get: (item) => item.tag },
    },
    is: {
      description: "Release type",
      scope: "client",
      strategy: {
        kind: "flag",
        get: (item) => item.prerelease,
        flagValue: "prerelease",
      },
    },
  },
};

export const DEPLOYMENT_FILTERS: FilterMap<DeploymentItem> = {
  name: "Deployments",
  textSearchFields: ["environment", "repo", "status", "creator", "ref"],
  textSearch: (item) => [item.environment, item.repo, item.status, item.creator, item.ref],
  filters: {
    repo: {
      description: "Repository",
      scope: "client",
      strategy: { kind: "exact", get: (item) => item.repo },
    },
    status: {
      description: "Deployment status",
      scope: "client",
      strategy: { kind: "exact", get: (item) => item.status },
    },
    creator: {
      description: "Creator",
      scope: "client",
      strategy: { kind: "exact", get: (item) => item.creator },
    },
    environment: { description: "Environment", scope: "server" },
    ref: { description: "Ref", scope: "server" },
    sha: { description: "Commit SHA", scope: "server" },
    task: { description: "Task", scope: "server" },
  },
};

/**
 * Per-column-type filter maps for generating query syntax documentation.
 * PR and Issue columns use the GitHub Search API (open-ended syntax), so they are not included.
 */
export const COLUMN_FILTERS: Record<ColumnType, FilterMap<any>> = {
  prs: PR_FILTERS,
  issues: ISSUE_FILTERS,
  ci: CI_FILTERS,
  activity: ACTIVITY_FILTERS,
  releases: RELEASE_FILTERS,
  deployments: DEPLOYMENT_FILTERS,
};

export function ciTokens(tokens: Tokens): { server: Tokens; client: Tokens } {
  return splitTokens(tokens, CI_FILTERS);
}

export function deploymentTokens(tokens: Tokens): { server: Tokens; client: Tokens } {
  return splitTokens(tokens, DEPLOYMENT_FILTERS);
}

/**
 * Client-side filter for all item types.
 * For PR and Issue items, all tokens are server-scoped — this passes through (returns true),
 * trusting the GitHub Search API to have already filtered the results.
 */
export function matchesTokens(item: KnownItem, tokens: Tokens): boolean {
  switch (item.type) {
    case "pr":
    case "issue":
      return true;
    case "ci":
      return applyFilters(item, CI_FILTERS, tokens);
    case "activity":
      return applyFilters(item, ACTIVITY_FILTERS, tokens);
    case "release":
      return applyFilters(item, RELEASE_FILTERS, tokens);
    case "deployment":
      return applyFilters(item, DEPLOYMENT_FILTERS, tokens);
  }
}

/**
 * Client-side filter for all item types, including PR and Issue.
 * Only use this in demo mode — in production, PR/Issue filtering is done by the GitHub Search API.
 */
export function matchesDemoTokens(item: KnownItem, tokens: Tokens): boolean {
  switch (item.type) {
    case "pr":
      return applyFilters(item, DEMO_PR_FILTERS, tokens);
    case "issue":
      return applyFilters(item, DEMO_ISSUE_FILTERS, tokens);
    case "ci":
      return applyFilters(item, CI_FILTERS, tokens);
    case "activity":
      return applyFilters(item, ACTIVITY_FILTERS, tokens);
    case "release":
      return applyFilters(item, RELEASE_FILTERS, tokens);
    case "deployment":
      return applyFilters(item, DEPLOYMENT_FILTERS, tokens);
  }
}
