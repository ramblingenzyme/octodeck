import { useState, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Syne:wght@400;600;700;800&display=swap');`;

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK = {
  prs: [
    { id: 1, title: "feat: add streaming support to inference pipeline", repo: "acme/ml-core", author: "sarahk", number: 847, reviews: { approved: 2, requested: 1 }, comments: 14, draft: false, age: "2h", labels: ["enhancement", "perf"] },
    { id: 2, title: "fix: race condition in job queue processor", repo: "acme/worker", author: "themarcus", number: 231, reviews: { approved: 0, requested: 2 }, comments: 6, draft: false, age: "5h", labels: ["bug", "urgent"] },
    { id: 3, title: "refactor: migrate from REST to tRPC", repo: "acme/api", author: "jliu", number: 419, reviews: { approved: 1, requested: 0 }, comments: 23, draft: true, age: "1d", labels: ["refactor"] },
    { id: 4, title: "chore: bump all dependencies to latest", repo: "acme/frontend", author: "bot[renovate]", number: 1102, reviews: { approved: 0, requested: 0 }, comments: 0, draft: false, age: "3h", labels: ["dependencies"] },
    { id: 5, title: "docs: update contributing guide with new branch conventions", repo: "acme/ml-core", author: "priya_d", number: 848, reviews: { approved: 3, requested: 0 }, comments: 2, draft: false, age: "6h", labels: ["documentation"] },
  ],
  issues: [
    { id: 1, title: "Memory leak in long-running inference jobs", repo: "acme/ml-core", number: 901, labels: ["bug", "critical"], assignee: "sarahk", comments: 8, age: "1d", state: "open" },
    { id: 2, title: "Support batching for embedding requests", repo: "acme/api", number: 503, labels: ["enhancement"], assignee: null, comments: 3, age: "3d", state: "open" },
    { id: 3, title: "CLI --watch flag breaks on Windows paths", repo: "acme/cli", number: 78, labels: ["bug", "platform"], assignee: "themarcus", comments: 11, age: "12h", state: "open" },
    { id: 4, title: "Add Prometheus metrics endpoint", repo: "acme/worker", number: 245, labels: ["enhancement", "observability"], assignee: null, comments: 4, age: "5d", state: "open" },
    { id: 5, title: "Rate limiter doesn't respect burst parameter", repo: "acme/api", number: 501, labels: ["bug"], assignee: "jliu", comments: 7, age: "2d", state: "open" },
  ],
  ci: [
    { id: 1, name: "CI / test (ubuntu, node 20)", repo: "acme/ml-core", branch: "feat/streaming", status: "success", duration: "4m 12s", age: "2h", triggered: "push" },
    { id: 2, name: "CI / test (ubuntu, node 18)", repo: "acme/api", branch: "main", status: "failure", duration: "1m 58s", age: "3h", triggered: "push" },
    { id: 3, name: "Deploy / staging", repo: "acme/frontend", branch: "main", status: "running", duration: "—", age: "12m", triggered: "push" },
    { id: 4, name: "CI / lint", repo: "acme/worker", branch: "fix/race-condition", status: "success", duration: "48s", age: "5h", triggered: "pull_request" },
    { id: 5, name: "Deploy / production", repo: "acme/api", branch: "v2.4.1", status: "success", duration: "8m 03s", age: "1d", triggered: "release" },
    { id: 6, name: "CI / type-check", repo: "acme/frontend", branch: "refactor/trpc", status: "failure", duration: "2m 11s", age: "1d", triggered: "pull_request" },
  ],
  notifications: [
    { id: 1, type: "review_requested", text: "themarcus requested your review", repo: "acme/worker", ref: "PR #231", age: "5h" },
    { id: 2, type: "mention", text: "sarahk mentioned you in a comment", repo: "acme/ml-core", ref: "Issue #901", age: "1d" },
    { id: 3, type: "assigned", text: "You were assigned", repo: "acme/cli", ref: "Issue #78", age: "12h" },
    { id: 4, type: "approved", text: "priya_d approved your PR", repo: "acme/ml-core", ref: "PR #848", age: "6h" },
    { id: 5, type: "comment", text: "jliu commented on your PR", repo: "acme/api", ref: "PR #419", age: "2h" },
    { id: 6, type: "review_requested", text: "jliu requested your review", repo: "acme/api", ref: "PR #419", age: "1d" },
  ],
  activity: [
    { id: 1, type: "commit", text: "Pushed 3 commits to feat/streaming", repo: "acme/ml-core", age: "2h", sha: "a3f9c12" },
    { id: 2, type: "comment", text: "Commented on Issue #901", repo: "acme/ml-core", age: "3h" },
    { id: 3, type: "pr_opened", text: "Opened PR #848", repo: "acme/ml-core", age: "6h" },
    { id: 4, type: "review", text: "Reviewed PR #231 — requested changes", repo: "acme/worker", age: "5h" },
    { id: 5, type: "commit", text: "Pushed 1 commit to main", repo: "acme/api", age: "1d", sha: "7bd2e41" },
    { id: 6, type: "issue_closed", text: "Closed Issue #497", repo: "acme/api", age: "1d" },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const LABEL_COLORS = {
  bug: { bg: "#3d1414", text: "#f87171" },
  critical: { bg: "#4a1515", text: "#fca5a5" },
  urgent: { bg: "#4a1515", text: "#fca5a5" },
  enhancement: { bg: "#0f2d1f", text: "#4ade80" },
  refactor: { bg: "#1a1a2e", text: "#818cf8" },
  documentation: { bg: "#1e2a1e", text: "#86efac" },
  dependencies: { bg: "#1a1a1a", text: "#9ca3af" },
  perf: { bg: "#1a2a1a", text: "#6ee7b7" },
  platform: { bg: "#1a1a2e", text: "#a5b4fc" },
  observability: { bg: "#2a1a2e", text: "#c4b5fd" },
};

const labelStyle = (label) =>
  LABEL_COLORS[label] || { bg: "#1a1a1a", text: "#9ca3af" };

const CI_STATUS = {
  success: { color: "#4ade80", bg: "#0f2d1f", label: "PASS", icon: "✓" },
  failure: { color: "#f87171", bg: "#3d1414", label: "FAIL", icon: "✗" },
  running: { color: "#fbbf24", bg: "#2d1f0a", label: "RUN", icon: "◉" },
};

const NOTIF_ICONS = {
  review_requested: "⟳",
  mention: "@",
  assigned: "→",
  approved: "✓",
  comment: "💬",
};

const ACTIVITY_ICONS = {
  commit: "●",
  comment: "💬",
  pr_opened: "⟳",
  review: "◈",
  issue_closed: "✗",
};

// ── Column Configs ────────────────────────────────────────────────────────────

const COLUMN_TYPES = {
  prs: { label: "Pull Requests", icon: "⟳", color: "#818cf8" },
  issues: { label: "Issues", icon: "◎", color: "#f87171" },
  ci: { label: "CI / CD", icon: "◉", color: "#fbbf24" },
  notifications: { label: "Notifications", icon: "@", color: "#4ade80" },
  activity: { label: "My Activity", icon: "●", color: "#c4b5fd" },
};

let _nextId = 100;
const mkId = () => ++_nextId;

const DEFAULT_COLUMNS = [
  { id: 1, type: "notifications", title: "Inbox" },
  { id: 2, type: "prs", title: "Open PRs" },
  { id: 3, type: "issues", title: "Issues" },
  { id: 4, type: "ci", title: "CI / CD" },
  { id: 5, type: "activity", title: "Activity" },
];

// ── Card Components ───────────────────────────────────────────────────────────

const PRCard = ({ item }) => (
  <div style={styles.card}>
    <div style={styles.cardTop}>
      <span style={{ ...styles.repo }}>{item.repo}</span>
      <span style={styles.age}>{item.age}</span>
    </div>
    <div style={styles.cardTitle}>
      {item.draft && <span style={styles.draftBadge}>DRAFT</span>}
      #{item.number} {item.title}
    </div>
    <div style={styles.cardMeta}>
      <span style={styles.author}>@{item.author}</span>
      <div style={styles.cardStats}>
        <span style={{ color: item.reviews.approved > 0 ? "#4ade80" : "#6b7280" }}>✓{item.reviews.approved}</span>
        {item.reviews.requested > 0 && <span style={{ color: "#fbbf24" }}>⟳{item.reviews.requested}</span>}
        <span style={{ color: "#6b7280" }}>💬{item.comments}</span>
      </div>
    </div>
    {item.labels.length > 0 && (
      <div style={styles.labels}>
        {item.labels.map(l => (
          <span key={l} style={{ ...styles.label, background: labelStyle(l).bg, color: labelStyle(l).text }}>{l}</span>
        ))}
      </div>
    )}
  </div>
);

const IssueCard = ({ item }) => (
  <div style={styles.card}>
    <div style={styles.cardTop}>
      <span style={styles.repo}>{item.repo}</span>
      <span style={styles.age}>{item.age}</span>
    </div>
    <div style={styles.cardTitle}>#{item.number} {item.title}</div>
    <div style={styles.cardMeta}>
      <span style={styles.author}>{item.assignee ? `→ ${item.assignee}` : "unassigned"}</span>
      <span style={{ color: "#6b7280" }}>💬{item.comments}</span>
    </div>
    {item.labels.length > 0 && (
      <div style={styles.labels}>
        {item.labels.map(l => (
          <span key={l} style={{ ...styles.label, background: labelStyle(l).bg, color: labelStyle(l).text }}>{l}</span>
        ))}
      </div>
    )}
  </div>
);

const CICard = ({ item }) => {
  const s = CI_STATUS[item.status];
  return (
    <div style={{ ...styles.card, borderLeft: `2px solid ${s.color}` }}>
      <div style={styles.cardTop}>
        <span style={styles.repo}>{item.repo}</span>
        <span style={styles.age}>{item.age}</span>
      </div>
      <div style={styles.cardTitle}>{item.name}</div>
      <div style={styles.cardMeta}>
        <span style={{ color: "#6b7280", fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}>
          {item.branch}
        </span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ color: "#6b7280", fontSize: "10px" }}>{item.duration}</span>
          <span style={{ ...styles.ciBadge, background: s.bg, color: s.color }}>{s.icon} {s.label}</span>
        </div>
      </div>
    </div>
  );
};

const NotifCard = ({ item }) => (
  <div style={styles.card}>
    <div style={styles.cardTop}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={styles.notifIcon}>{NOTIF_ICONS[item.type]}</span>
        <span style={styles.repo}>{item.repo}</span>
      </div>
      <span style={styles.age}>{item.age}</span>
    </div>
    <div style={styles.cardTitle}>{item.text}</div>
    <div style={{ color: "#818cf8", fontSize: "11px", marginTop: "4px", fontFamily: "JetBrains Mono, monospace" }}>
      {item.ref}
    </div>
  </div>
);

const ActivityCard = ({ item }) => (
  <div style={styles.card}>
    <div style={styles.cardTop}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={styles.notifIcon}>{ACTIVITY_ICONS[item.type]}</span>
        <span style={styles.repo}>{item.repo}</span>
      </div>
      <span style={styles.age}>{item.age}</span>
    </div>
    <div style={styles.cardTitle}>{item.text}</div>
    {item.sha && (
      <div style={{ color: "#4ade80", fontSize: "10px", marginTop: "4px", fontFamily: "JetBrains Mono, monospace" }}>
        {item.sha}
      </div>
    )}
  </div>
);

const CARD_MAP = { prs: PRCard, issues: IssueCard, ci: CICard, notifications: NotifCard, activity: ActivityCard };
const DATA_MAP = { prs: MOCK.prs, issues: MOCK.issues, ci: MOCK.ci, notifications: MOCK.notifications, activity: MOCK.activity };

// ── Column ────────────────────────────────────────────────────────────────────

const Column = ({ col, onRemove, onMoveLeft, onMoveRight, isFirst, isLast }) => {
  const cfg = COLUMN_TYPES[col.type];
  const Card = CARD_MAP[col.type];
  const data = DATA_MAP[col.type];
  const [confirming, setConfirming] = useState(false);

  return (
    <div style={styles.column}>
      <div style={{ ...styles.colHeader, borderBottom: `1px solid ${cfg.color}22` }}>
        {confirming ? (
          <div style={styles.confirmBar}>
            <span style={styles.confirmText}>Remove "{col.title}"?</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button style={styles.confirmNo} onClick={() => setConfirming(false)}>No</button>
              <button style={styles.confirmYes} onClick={onRemove}>Yes, remove</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: cfg.color, fontSize: "14px" }}>{cfg.icon}</span>
              <span style={{ ...styles.colTitle, color: cfg.color }}>{col.title}</span>
              <span style={styles.countBadge}>{data.length}</span>
            </div>
            <div style={styles.colActions}>
              <button style={styles.iconBtn} onClick={onMoveLeft} disabled={isFirst} title="Move left">◁</button>
              <button style={styles.iconBtn} onClick={onMoveRight} disabled={isLast} title="Move right">▷</button>
              <button style={{ ...styles.iconBtn, color: "#f87171" }} onClick={() => setConfirming(true)} title="Remove column">✕</button>
            </div>
          </>
        )}
      </div>
      <div style={styles.colBody}>
        {data.map(item => <Card key={item.id} item={item} />)}
      </div>
    </div>
  );
};

// ── Add Column Modal ──────────────────────────────────────────────────────────

const AddColumnModal = ({ onAdd, onClose, existing }) => {
  const [type, setType] = useState("prs");
  const [title, setTitle] = useState(COLUMN_TYPES["prs"].label);

  const handleTypeChange = (t) => {
    setType(t);
    setTitle(COLUMN_TYPES[t].label);
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>Add Column</span>
          <button style={{ ...styles.iconBtn, color: "#9ca3af" }} onClick={onClose}>✕</button>
        </div>
        <div style={styles.modalBody}>
          <label style={styles.label2}>Column Type</label>
          <div style={styles.typeGrid}>
            {Object.entries(COLUMN_TYPES).map(([k, v]) => (
              <button
                key={k}
                className={`type-btn${type === k ? " active" : ""}`}
                onClick={() => handleTypeChange(k)}
              >
                <span style={{ color: v.color, fontSize: "13px", width: "16px", textAlign: "center", flexShrink: 0 }}>{v.icon}</span>
                <span style={{ color: type === k ? "#e5e7eb" : "#9ca3af" }}>{v.label}</span>
                {type === k && <span style={{ marginLeft: "auto", color: v.color, fontSize: "10px" }}>✓</span>}
              </button>
            ))}
          </div>
          <label style={{ ...styles.label2, marginTop: "16px" }}>Column Title</label>
          <input
            style={styles.input}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.addBtn} onClick={() => onAdd({ id: mkId(), type, title })}>
            + Add Column
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [showModal, setShowModal] = useState(false);

  const removeCol = (id) => setColumns(cols => cols.filter(c => c.id !== id));
  const addCol = (col) => { setColumns(cols => [...cols, col]); setShowModal(false); };
  const moveLeft = (idx) => {
    if (idx === 0) return;
    setColumns(cols => { const a = [...cols]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a; });
  };
  const moveRight = (idx) => {
    setColumns(cols => {
      if (idx >= cols.length - 1) return cols;
      const a = [...cols]; [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a;
    });
  };

  return (
    <>
      <style>{FONTS}</style>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0d0d0d; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
        button { font-family: 'JetBrains Mono', monospace; }
        button:disabled { opacity: 0.25; cursor: not-allowed; }
        .type-btn { all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 10px; width: 100%; background: #111111; border: 1px solid #1f1f1f; border-radius: 3px; padding: 9px 12px; cursor: pointer; color: #9ca3af; font-size: 11px; font-family: 'JetBrains Mono', monospace; transition: border-color 0.15s, background 0.15s; margin-bottom: 4px; }
        .type-btn:hover { border-color: #2a2a2a; background: #161616; }
        .type-btn.active { border-color: #818cf8 !important; background: #13131f !important; }
        input:focus { border-color: #818cf8 !important; outline: none; }
      `}</style>
      <div style={styles.root}>
        {/* Topbar */}
        <div style={styles.topbar}>
          <div style={styles.topbarLeft}>
            <span style={styles.logo}>⬡</span>
            <span style={styles.logoText}>HUBDECK</span>
            <span style={styles.logoSub}>github dashboard</span>
          </div>
          <div style={styles.topbarRight}>
            <span style={styles.statusDot} />
            <span style={styles.statusText}>connected · mock data</span>
            <button style={styles.addColBtn} onClick={() => setShowModal(true)}>
              + Add Column
            </button>
          </div>
        </div>

        {/* Column Strip */}
        <div style={styles.board}>
          {columns.length === 0 && (
            <div style={styles.empty}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>⬡</div>
              <div style={{ color: "#4b5563", fontSize: "14px" }}>No columns yet.</div>
              <button style={{ ...styles.addColBtn, marginTop: "16px" }} onClick={() => setShowModal(true)}>
                + Add Column
              </button>
            </div>
          )}
          {columns.map((col, idx) => (
            <Column
              key={col.id}
              col={col}
              onRemove={() => removeCol(col.id)}
              onMoveLeft={() => moveLeft(idx)}
              onMoveRight={() => moveRight(idx)}
              isFirst={idx === 0}
              isLast={idx === columns.length - 1}
            />
          ))}
        </div>

        {showModal && <AddColumnModal onAdd={addCol} onClose={() => setShowModal(false)} existing={columns} />}
      </div>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  root: {
    background: "#080808",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#e5e7eb",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    height: "48px",
    borderBottom: "1px solid #1a1a1a",
    background: "#0a0a0a",
    flexShrink: 0,
  },
  topbarLeft: { display: "flex", alignItems: "center", gap: "10px" },
  logo: { color: "#818cf8", fontSize: "20px", lineHeight: 1 },
  logoText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "16px", color: "#f3f4f6", letterSpacing: "0.08em" },
  logoSub: { color: "#374151", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" },
  topbarRight: { display: "flex", alignItems: "center", gap: "12px" },
  statusDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" },
  statusText: { color: "#374151", fontSize: "10px", letterSpacing: "0.05em" },
  addColBtn: {
    background: "transparent",
    border: "1px solid #818cf8",
    color: "#818cf8",
    padding: "5px 12px",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.05em",
    transition: "all 0.15s",
  },
  board: {
    display: "flex",
    flex: 1,
    overflowX: "auto",
    overflowY: "hidden",
    padding: "16px",
    gap: "12px",
    alignItems: "flex-start",
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#374151",
    paddingTop: "80px",
  },
  column: {
    width: "300px",
    minWidth: "300px",
    background: "#0d0d0d",
    border: "1px solid #1a1a1a",
    borderRadius: "4px",
    display: "flex",
    flexDirection: "column",
    maxHeight: "calc(100vh - 96px)",
    flexShrink: 0,
  },
  colHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    background: "#0a0a0a",
    borderRadius: "4px 4px 0 0",
    flexShrink: 0,
  },
  colTitle: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  countBadge: {
    background: "#1a1a1a",
    color: "#6b7280",
    fontSize: "9px",
    padding: "1px 5px",
    borderRadius: "2px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  colActions: { display: "flex", gap: "4px" },
  iconBtn: {
    background: "none",
    border: "none",
    color: "#374151",
    cursor: "pointer",
    fontSize: "11px",
    padding: "3px 5px",
    borderRadius: "2px",
    fontFamily: "'JetBrains Mono', monospace",
    lineHeight: 1,
  },
  colBody: {
    overflowY: "auto",
    flex: 1,
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  card: {
    background: "#111111",
    border: "1px solid #1f1f1f",
    borderRadius: "3px",
    padding: "10px",
    cursor: "default",
    transition: "border-color 0.15s",
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" },
  repo: { color: "#4b5563", fontSize: "9px", letterSpacing: "0.05em", textTransform: "uppercase" },
  age: { color: "#374151", fontSize: "9px" },
  cardTitle: { fontSize: "11px", color: "#d1d5db", lineHeight: "1.5", marginBottom: "6px" },
  cardMeta: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardStats: { display: "flex", gap: "8px", fontSize: "10px" },
  author: { color: "#6b7280", fontSize: "10px" },
  labels: { display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "7px" },
  label: { fontSize: "9px", padding: "2px 6px", borderRadius: "2px", letterSpacing: "0.03em" },
  ciBadge: { fontSize: "9px", padding: "2px 6px", borderRadius: "2px", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace" },
  notifIcon: { color: "#818cf8", fontSize: "11px" },
  draftBadge: {
    background: "#1f2937",
    color: "#6b7280",
    fontSize: "8px",
    padding: "1px 5px",
    borderRadius: "2px",
    marginRight: "4px",
    letterSpacing: "0.1em",
  },
  // Modal
  modalOverlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#0d0d0d",
    border: "1px solid #2a2a2a",
    borderRadius: "4px",
    width: "380px",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderBottom: "1px solid #1a1a1a",
    background: "#0a0a0a",
  },
  modalTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "13px", letterSpacing: "0.08em", color: "#f3f4f6" },
  modalBody: { padding: "16px" },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    padding: "12px 16px",
    borderTop: "1px solid #1a1a1a",
    background: "#0a0a0a",
  },
  label2: { display: "block", color: "#6b7280", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" },
  typeGrid: { display: "flex", flexDirection: "column", gap: "4px" },
  typeBtn: {
    display: "flex", alignItems: "center", gap: "10px",
    background: "#111", border: "1px solid #1f1f1f",
    borderRadius: "3px", padding: "9px 12px",
    cursor: "pointer", color: "#9ca3af", fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace", textAlign: "left",
    transition: "all 0.15s", width: "100%",
  },
  typeBtnActive: { borderColor: "#818cf8", background: "#13131f", color: "#e5e7eb" },
  input: {
    width: "100%", background: "#111", border: "1px solid #1f1f1f",
    borderRadius: "3px", padding: "8px 10px",
    color: "#e5e7eb", fontSize: "12px",
    fontFamily: "'JetBrains Mono', monospace",
    outline: "none",
  },
  cancelBtn: {
    background: "none", border: "1px solid #1f1f1f",
    color: "#6b7280", padding: "6px 14px", borderRadius: "3px",
    cursor: "pointer", fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  addBtn: {
    background: "#13131f", border: "1px solid #818cf8",
    color: "#818cf8", padding: "6px 14px", borderRadius: "3px",
    cursor: "pointer", fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.05em",
  },
  confirmBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", gap: "8px",
  },
  confirmText: {
    color: "#f87171", fontSize: "10px", letterSpacing: "0.05em",
  },
  confirmYes: {
    background: "#3d1414", border: "1px solid #f87171",
    color: "#f87171", padding: "3px 10px", borderRadius: "3px",
    cursor: "pointer", fontSize: "10px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  confirmNo: {
    background: "none", border: "1px solid #2a2a2a",
    color: "#6b7280", padding: "3px 10px", borderRadius: "3px",
    cursor: "pointer", fontSize: "10px",
    fontFamily: "'JetBrains Mono', monospace",
  },
}