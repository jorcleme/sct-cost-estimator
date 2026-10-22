import { FormEvent, ReactNode, useMemo, useState } from "react";

type IconName =
  | "spark"
  | "grid"
  | "document"
  | "chart"
  | "settings"
  | "help"
  | "chevron"
  | "arrow"
  | "check"
  | "send"
  | "info";

type ModelKey =
  | "gpt41mini"
  | "gpt54nano"
  | "gpt54mini"
  | "gpt5mini"
  | "gpt56sol"
  | "gpt54"
  | "opus55";
type AgentKey =
  | "query_refiner"
  | "router"
  | "researcher"
  | "librarian"
  | "grader"
  | "writer"
  | "auditor"
  | "reviewer"
  | "prerequisite_extractor"
  | "finalizer"
  | "intent_parser"
  | "section_editor";

const models: Record<
  ModelKey,
  {
    name: string;
    provider: string;
    input: number;
    output: number;
  }
> = {
  gpt41mini: {
    name: "GPT-4.1 mini",
    provider: "OpenAI",
    input: 0.4,
    output: 1.6
  },
  gpt54nano: {
    name: "GPT-5.4 nano",
    provider: "OpenAI",
    input: 0.1,
    output: 0.4
  },
  gpt54mini: {
    name: "GPT-5.4 mini",
    provider: "OpenAI",
    input: 0.75,
    output: 3.75
  },
  gpt5mini: {
    name: "GPT-5 mini",
    provider: "OpenAI",
    input: 0.25,
    output: 2
  },
  gpt56sol: {
    name: "GPT-5.6-sol",
    provider: "OpenAI",
    input: 1.5,
    output: 6
  },
  gpt54: {
    name: "GPT-5.4",
    provider: "OpenAI",
    input: 5,
    output: 25
  },
  opus55: {
    name: "Claude Opus 5.5",
    provider: "Anthropic",
    input: 15,
    output: 75
  }
};

const agentMeta: Record<
  AgentKey,
  { label: string; short: string; detail: string }
> = {
  query_refiner: {
    label: "Query refiner",
    short: "QR",
    detail: "Scope + clarification interrupt"
  },
  router: {
    label: "Router",
    short: "RT",
    detail: "Classify CLI vs Web UI"
  },
  researcher: {
    label: "Researcher",
    short: "RS",
    detail: "Decompose + hybrid retrieval"
  },
  librarian: {
    label: "Librarian",
    short: "LB",
    detail: "Parallel supplementary retrieval"
  },
  grader: {
    label: "Grader",
    short: "GR",
    detail: "Relevance gate · max 25 docs"
  },
  writer: {
    label: "Writer",
    short: "WR",
    detail: "High-reasoning structured draft"
  },
  auditor: {
    label: "Auditor",
    short: "AU",
    detail: "Scope + completeness gate"
  },
  reviewer: {
    label: "Reviewer",
    short: "RV",
    detail: "Quality review + re-audit route"
  },
  prerequisite_extractor: {
    label: "Prerequisite extractor",
    short: "PX",
    detail: "Post-review requirements"
  },
  finalizer: {
    label: "Finalizer",
    short: "FN",
    detail: "Final article assembly"
  },
  intent_parser: {
    label: "Intent parser",
    short: "IP",
    detail: "Checkpoint Q&A intent"
  },
  section_editor: {
    label: "Section editor",
    short: "SE",
    detail: "Targeted resumed edits"
  }
};

const defaultAgentModels: Record<AgentKey, ModelKey> = {
  query_refiner: "gpt41mini",
  router: "gpt54mini",
  researcher: "gpt41mini",
  librarian: "gpt41mini",
  grader: "gpt54nano",
  writer: "gpt54",
  auditor: "gpt54",
  reviewer: "gpt54",
  prerequisite_extractor: "gpt41mini",
  finalizer: "gpt5mini",
  intent_parser: "gpt54nano",
  section_editor: "gpt54nano"
};

function resolveAgentModel(
  routing: Partial<Record<AgentKey, ModelKey>> | null | undefined,
  agent: AgentKey
): ModelKey {
  const candidate = routing?.[agent];
  return candidate && models[candidate] ? candidate : defaultAgentModels[agent];
}

const economyRouting: Record<AgentKey, ModelKey> = {
  ...defaultAgentModels,
  writer: "gpt56sol",
  auditor: "gpt54mini",
  reviewer: "gpt54mini"
};

const premiumRouting: Record<AgentKey, ModelKey> = {
  ...defaultAgentModels,
  researcher: "gpt54mini",
  librarian: "gpt54mini",
  writer: "opus55",
  auditor: "gpt54",
  reviewer: "gpt54",
  finalizer: "gpt54mini"
};

const scenarios = [
  {
    id: "lean",
    name: "Economy route",
    description: "Premium model only for writing",
    route: economyRouting,
    words: 900,
    sources: 2,
    revisions: 0
  },
  {
    id: "balanced",
    name: "Smart routing",
    description: "Right model for each graph node",
    route: defaultAgentModels,
    words: 1500,
    sources: 5,
    revisions: 1
  },
  {
    id: "authority",
    name: "Maximum quality",
    description: "Opus writer with premium review",
    route: premiumRouting,
    words: 2400,
    sources: 10,
    revisions: 3
  }
];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    spark: (
      <>
        <path d="M12 2.5c.5 4.2 2.8 6.5 7 7-4.2.5-6.5 2.8-7 7-.5-4.2-2.8-6.5-7-7 4.2-.5 6.5-2.8 7-7Z" />
        <path d="M5 15c.2 2.1 1.4 3.3 3.5 3.5C6.4 18.7 5.2 19.9 5 22c-.2-2.1-1.4-3.3-3.5-3.5C3.6 18.3 4.8 17.1 5 15Z" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    document: (
      <>
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5M10 13h5M10 17h5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.8 9a2.3 2.3 0 1 1 3.1 2.2c-.9.3-.9 1-.9 1.8M12 17h.01" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
    check: <path d="m5 12 4 4L19 6" />,
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    )
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <label className="slider-control">
      <div className="control-label">
        <span>{label}</span>
        <strong>
          {value.toLocaleString()}
          {suffix}
        </strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--range-progress": `${percent}%` } as React.CSSProperties}
      />
      <div className="range-labels">
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </label>
  );
}

function App() {
  const [articles, setArticles] = useState(40);
  const [words, setWords] = useState(1500);
  const [sources, setSources] = useState(5);
  const [revisions, setRevisions] = useState(1);
  const [rewriteRate, setRewriteRate] = useState(35);
  const [reviewRate, setReviewRate] = useState(20);
  const [clarificationRate, setClarificationRate] = useState(30);
  const [editRate, setEditRate] = useState(15);
  const [agentModels, setAgentModels] =
    useState<Record<AgentKey, ModelKey>>(defaultAgentModels);
  const [features, setFeatures] = useState({
    seo: true,
    factCheck: true,
    citations: false
  });
  const [activeScenario, setActiveScenario] = useState("balanced");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(
    "Smart routing keeps classification and audit work on efficient models while reserving GPT-5.4 for the high-reasoning writer. The bounded audit loop is your largest source of cost variance."
  );

  const estimate = useMemo(() => {
    const rewriteProbability = rewriteRate / 100;
    const reviewProbability = reviewRate / 100;
    const clarificationProbability = clarificationRate / 100;
    const editProbability = editRate / 100;
    const expectedRewrites = Array.from(
      { length: revisions },
      (_, index) => rewriteProbability ** (index + 1)
    ).reduce((sum, value) => sum + value, 0);
    const writerCalls =
      1 + expectedRewrites + reviewProbability * rewriteProbability;
    const auditorCalls = 1 + expectedRewrites + reviewProbability;
    const reviewerCalls = 1 + reviewProbability;
    const featureInput =
      (features.seo ? 550 : 0) +
      (features.factCheck ? sources * 220 + 400 : 0) +
      (features.citations ? sources * 150 : 0);
    const featureOutput =
      (features.seo ? 280 : 0) +
      (features.factCheck ? 180 : 0) +
      (features.citations ? sources * 36 : 0);

    const rawAgents: Record<
      AgentKey,
      { input: number; output: number; calls: number }
    > = {
      query_refiner: {
        input: 1100 * (1 + clarificationProbability),
        output: 260 * (1 + clarificationProbability),
        calls: 1 + clarificationProbability
      },
      router: { input: 1250, output: 120, calls: 1 },
      researcher: {
        input: 1700 + sources * 210,
        output: 420 + sources * 62,
        calls: 1
      },
      librarian: {
        input: 1300 + sources * 160,
        output: 300 + sources * 42,
        calls: 1
      },
      grader: {
        input: 1900 + Math.min(sources, 25) * 480,
        output: 520 + Math.min(sources, 25) * 32,
        calls: 1
      },
      writer: {
        input: (3100 + sources * 680 + featureInput) * writerCalls,
        output: (words * 1.38 + featureOutput) * writerCalls,
        calls: writerCalls
      },
      auditor: {
        input: (words * 1.42 + sources * 520 + 1500) * auditorCalls,
        output: (520 + sources * 34) * auditorCalls,
        calls: auditorCalls
      },
      reviewer: {
        input: (words * 1.45 + sources * 360 + 1200) * reviewerCalls,
        output: (650 + words * 0.16) * reviewerCalls,
        calls: reviewerCalls
      },
      prerequisite_extractor: {
        input: words * 1.35 + sources * 190,
        output: 360,
        calls: 1
      },
      finalizer: {
        input: words * 1.45 + 900,
        output: words * 0.18 + 260,
        calls: 1
      },
      intent_parser: {
        input: 850 * editProbability,
        output: 120 * editProbability,
        calls: editProbability
      },
      section_editor: {
        input: (words * 0.4 + 950) * editProbability,
        output: (words * 0.24 + 180) * editProbability,
        calls: editProbability
      }
    };

    const agents = (Object.keys(rawAgents) as AgentKey[]).map((key) => {
      const usage = rawAgents[key];
      const selected = models[resolveAgentModel(agentModels, key)];
      const input = Math.round(usage.input);
      const output = Math.round(usage.output);
      const cost =
        (input / 1_000_000) * selected.input +
        (output / 1_000_000) * selected.output;
      return { key, input, output, calls: usage.calls, cost };
    });

    const inputTokens = agents.reduce((sum, agent) => sum + agent.input, 0);
    const outputTokens = agents.reduce((sum, agent) => sum + agent.output, 0);
    const modelCost = agents.reduce((sum, agent) => sum + agent.cost, 0);
    const expectedCalls = agents.reduce((sum, agent) => sum + agent.calls, 0);
    const tracingCost =
      0.0042 +
      expectedRewrites * 0.0018 +
      clarificationProbability * 0.001 +
      editProbability * 0.0015;
    const searchCost = sources * 0.0015;
    const perArticle = modelCost + tracingCost + searchCost;
    const monthly = perArticle * articles;
    return {
      agents,
      expectedCalls,
      expectedRewrites,
      expectedHumanTurns: clarificationProbability + editProbability,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      tracingCost,
      searchCost,
      perArticle,
      monthly,
      low: monthly * 0.86,
      high: monthly * 1.22
    };
  }, [
    agentModels,
    articles,
    clarificationRate,
    editRate,
    features,
    revisions,
    reviewRate,
    rewriteRate,
    sources,
    words
  ]);

  const formatMoney = (value: number, digits = 2) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(value);

  const applyScenario = (scenario: (typeof scenarios)[number]) => {
    setActiveScenario(scenario.id);
    setAgentModels(scenario.route);
    setWords(scenario.words);
    setSources(scenario.sources);
    setRevisions(scenario.revisions);
  };

  const askQuestion = (event: FormEvent) => {
    event.preventDefault();
    if (!question.trim()) return;
    const lower = question.toLowerCase();
    if (
      lower.includes("cheap") ||
      lower.includes("save") ||
      lower.includes("reduce")
    ) {
      setAnswer(
        `Keep GPT-5.4 on the writer, but route the Router and Auditor to GPT-5.4 mini. Reducing the expected rewrite rate is the next best lever: every avoided writer → auditor loop saves premium generation and review tokens.`
      );
    } else if (lower.includes("token")) {
      setAnswer(
        `One LangGraph run is estimated at ${estimate.totalTokens.toLocaleString()} tokens: ${estimate.inputTokens.toLocaleString()} input and ${estimate.outputTokens.toLocaleString()} output across ${Object.keys(agentMeta).length} configured model routes. The writer is routed to ${models[resolveAgentModel(agentModels, "writer")].name}; expected audit rewrites are ${estimate.expectedRewrites.toFixed(2)} per article.`
      );
    } else {
      setAnswer(
        `For ${articles} articles per month, plan on ${formatMoney(estimate.monthly)} with a working range of ${formatMoney(estimate.low)}–${formatMoney(estimate.high)}. This includes research calls and tracing, but excludes human editorial time.`
      );
    }
    setQuestion("");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="spark" size={20} />
          </span>
          <span>SCT Costs Estimator</span>
        </div>
        <nav className="side-nav" aria-label="Primary navigation">
          <button className="nav-item active">
            <Icon name="grid" />
            Cost estimator
          </button>
          <button className="nav-item">
            <Icon name="document" />
            Generation runs
          </button>
          <button className="nav-item">
            <Icon name="chart" />
            Usage
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item">
            <Icon name="settings" />
            Settings
          </button>
          <button className="nav-item">
            <Icon name="help" />
            Help center
          </button>
          <div className="workspace-card">
            <span className="avatar">SC</span>
            <span>
              <strong>SCT Content</strong>
              <small>Production workspace</small>
            </span>
            <Icon name="chevron" size={15} />
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">
              <Icon name="spark" size={18} />
            </span>
            Draftline
          </div>
          <div className="status-pill">
            <span />
            LangSmith connected
          </div>
          <button className="icon-button" aria-label="Help">
            <Icon name="help" size={19} />
          </button>
          <span className="header-avatar">AB</span>
        </header>

        <div className="page">
          <section className="page-heading">
            <div>
              <p className="eyebrow">ARTICLE ECONOMICS</p>
              <h1>Plan content spend with confidence.</h1>
              <p className="lede">
                Model the true cost of your LangGraph article workflow—from
                routing and retrieval through bounded writer-auditor loops.
              </p>
            </div>
            <div className="heading-actions">
              <button className="secondary-button">Save estimate</button>
              <button className="primary-button">
                View generation runs
                <Icon name="arrow" size={17} />
              </button>
            </div>
          </section>

          <section className="scenario-strip" aria-label="Estimate scenarios">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                className={`scenario-card ${
                  activeScenario === scenario.id ? "active" : ""
                }`}
                onClick={() => applyScenario(scenario)}
              >
                <span className="scenario-radio">
                  {activeScenario === scenario.id && <span />}
                </span>
                <span>
                  <strong>{scenario.name}</strong>
                  <small>{scenario.description}</small>
                </span>
              </button>
            ))}
          </section>

          <section className="manager-summary" aria-label="Pipeline summary">
            <div>
              <span>Compiled graph</span>
              <strong>13 nodes</strong>
              <small>End-to-end generation</small>
            </div>
            <div>
              <span>Expected model calls</span>
              <strong>{estimate.expectedCalls.toFixed(1)}</strong>
              <small>Per completed article</small>
            </div>
            <div>
              <span>Retrieval strategy</span>
              <strong>2× parallel</strong>
              <small>Researcher + Librarian</small>
            </div>
            <div>
              <span>Human-in-the-loop</span>
              <strong>{estimate.expectedHumanTurns.toFixed(2)} turns</strong>
              <small>Interrupts + resumed edits</small>
            </div>
          </section>

          <div className="estimator-grid">
            <section className="panel assumptions-panel">
              <div className="panel-heading">
                <div>
                  <span className="step">01</span>
                  <h2>Workflow assumptions</h2>
                </div>
                <span className="auto-save">Changes update live</span>
              </div>

              <div className="control-section">
                <details className="route-details">
                  <summary>
                    <span>
                      <strong>Baseline model routing</strong>
                      <small>12 configured agent roles from V2Config</small>
                    </span>
                    <span className="planning-rate">View & edit</span>
                  </summary>
                  <div className="agent-routing-grid">
                    {(Object.keys(agentMeta) as AgentKey[]).map((agent) => (
                      <label className="agent-route" key={agent}>
                        <span className={`agent-badge ${agent}`}>
                          {agentMeta[agent].short}
                        </span>
                        <span className="agent-route-copy">
                          <strong>{agentMeta[agent].label}</strong>
                          <small>{agentMeta[agent].detail}</small>
                        </span>
                        <select
                          value={resolveAgentModel(agentModels, agent)}
                          onChange={(event) => {
                            setAgentModels((current) => {
                              const normalized = (
                                Object.keys(agentMeta) as AgentKey[]
                              ).reduce(
                                (routing, key) => ({
                                  ...routing,
                                  [key]: resolveAgentModel(current, key)
                                }),
                                {} as Record<AgentKey, ModelKey>
                              );
                              return {
                                ...normalized,
                                [agent]: event.target.value as ModelKey
                              };
                            });
                            setActiveScenario("");
                          }}
                          aria-label={`${agentMeta[agent].label} model`}
                        >
                          {Object.entries(models).map(([key, item]) => (
                            <option key={key} value={key}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                        <span className="agent-rate">
                          $
                          {models[
                            resolveAgentModel(agentModels, agent)
                          ].input.toFixed(2)}{" "}
                          in · $
                          {models[
                            resolveAgentModel(agentModels, agent)
                          ].output.toFixed(2)}{" "}
                          out / 1M
                        </span>
                      </label>
                    ))}
                  </div>
                </details>
              </div>

              <div className="graph-path" aria-label="LangGraph execution path">
                <span className="graph-label">Compiled production path</span>
                <div className="graph-nodes">
                  <span>Refine + route</span>
                  <i>→</i>
                  <span>Retrieval ×2</span>
                  <i>→</i>
                  <span>Grade + write</span>
                  <i>⇄</i>
                  <span>Audit + review</span>
                  <i>→</i>
                  <span>Capture + finalize</span>
                </div>
                <small>
                  Checkpointed clarifications pause and resume the same thread ·
                  audit and review each have bounded loops
                </small>
              </div>

              <div className="sliders-grid">
                <Slider
                  label="Articles per month"
                  value={articles}
                  min={5}
                  max={200}
                  step={5}
                  onChange={setArticles}
                />
                <Slider
                  label="Target article length"
                  value={words}
                  min={500}
                  max={3500}
                  step={100}
                  suffix=" words"
                  onChange={(value) => {
                    setWords(value);
                    setActiveScenario("");
                  }}
                />
                <Slider
                  label="Returned research documents"
                  value={sources}
                  min={0}
                  max={25}
                  onChange={(value) => {
                    setSources(value);
                    setActiveScenario("");
                  }}
                />
                <Slider
                  label="Max audit rewrites"
                  value={revisions}
                  min={0}
                  max={3}
                  onChange={(value) => {
                    setRevisions(value);
                    setActiveScenario("");
                  }}
                />
                <Slider
                  label="Expected rewrite rate"
                  value={rewriteRate}
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                  onChange={(value) => {
                    setRewriteRate(value);
                    setActiveScenario("");
                  }}
                />
                <Slider
                  label="Reviewer re-audit rate"
                  value={reviewRate}
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                  onChange={setReviewRate}
                />
                <Slider
                  label="Clarification interrupt rate"
                  value={clarificationRate}
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                  onChange={setClarificationRate}
                />
                <Slider
                  label="Post-draft Q&A edit rate"
                  value={editRate}
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                  onChange={setEditRate}
                />
              </div>

              <div className="feature-section">
                <div className="section-title-row">
                  <span>Pipeline steps</span>
                  <button aria-label="More information">
                    <Icon name="info" size={16} />
                  </button>
                </div>
                <div className="feature-grid">
                  {[
                    ["seo", "SEO optimization", "Keywords, metadata, outline"],
                    [
                      "factCheck",
                      "Fact-check pass",
                      "Claims checked against sources"
                    ],
                    [
                      "citations",
                      "Inline citations",
                      "Source links and attribution"
                    ]
                  ].map(([key, title, description]) => (
                    <button
                      key={key}
                      className={`feature-option ${
                        features[key as keyof typeof features] ? "selected" : ""
                      }`}
                      onClick={() =>
                        setFeatures((current) => ({
                          ...current,
                          [key]: !current[key as keyof typeof current]
                        }))
                      }
                    >
                      <span className="checkbox">
                        {features[key as keyof typeof features] && (
                          <Icon name="check" size={14} />
                        )}
                      </span>
                      <span>
                        <strong>{title}</strong>
                        <small>{description}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="panel estimate-panel">
              <div className="panel-heading">
                <div>
                  <span className="step coral">02</span>
                  <h2>Your estimate</h2>
                </div>
                <span className="confidence">High confidence</span>
              </div>

              <div className="hero-cost">
                <span>ESTIMATED MONTHLY COST</span>
                <div>
                  <strong>{formatMoney(estimate.monthly)}</strong>
                  <small>/ month</small>
                </div>
                <p>
                  {formatMoney(estimate.low)}–{formatMoney(estimate.high)}{" "}
                  expected range
                </p>
                <div className="range-bar">
                  <span />
                  <i />
                </div>
              </div>

              <div className="metric-row">
                <div>
                  <span>Per article</span>
                  <strong>{formatMoney(estimate.perArticle, 3)}</strong>
                </div>
                <div>
                  <span>Tokens / article</span>
                  <strong>{(estimate.totalTokens / 1000).toFixed(1)}k</strong>
                </div>
                <div>
                  <span>Annual projection</span>
                  <strong>{formatMoney(estimate.monthly * 12)}</strong>
                </div>
              </div>

              <div className="breakdown">
                <div className="breakdown-heading">
                  <span>Per-agent breakdown</span>
                  <span>Model · Tokens · Cost</span>
                </div>
                {estimate.agents.map((agent, index) => (
                  <div
                    className="breakdown-row agent-breakdown"
                    key={agent.key}
                  >
                    <span>
                      <i
                        className={`dot ${
                          ["violet", "mint", "coral-dot", "blue"][index % 4]
                        }`}
                      />
                      <span>
                        {agentMeta[agent.key].label}
                        <small>
                          {agent.key === "grader"
                            ? `${Math.min(sources, 25)} docs · 1 batched call`
                            : `${agent.calls.toFixed(agent.calls % 1 ? 2 : 0)} expected call${agent.calls === 1 ? "" : "s"}`}
                        </small>
                      </span>
                    </span>
                    <span>
                      <small>
                        {models[resolveAgentModel(agentModels, agent.key)].name}
                      </small>
                      {(agent.input + agent.output).toLocaleString()} ·{" "}
                      <strong>{formatMoney(agent.cost, 3)}</strong>
                    </span>
                  </div>
                ))}
                <div className="breakdown-row">
                  <span>
                    <i className="dot mint" />
                    Hybrid retrieval infra
                  </span>
                  <span>
                    {sources} returned documents ·{" "}
                    <strong>{formatMoney(estimate.searchCost, 3)}</strong>
                  </span>
                </div>
                <div className="breakdown-row">
                  <span>
                    <i className="dot slate" />
                    LangSmith tracing
                  </span>
                  <span>
                    1 trace ·{" "}
                    <strong>{formatMoney(estimate.tracingCost, 3)}</strong>
                  </span>
                </div>
              </div>

              <div className="assumption-note">
                <Icon name="info" size={17} />
                <p>
                  Pricing is an editable planning assumption. Token shapes cover
                  the supplied 13-node graph, parallel retrieval, bounded
                  quality loops, checkpoint interruptions, and resumed edits.
                  Calibrate with production LangSmith traces.
                </p>
              </div>
            </section>
          </div>

          <section className="qa-panel">
            <div className="qa-copy">
              <span className="qa-icon">
                <Icon name="spark" size={21} />
              </span>
              <div>
                <p className="eyebrow">ASK THE ESTIMATE</p>
                <h2>Pressure-test your plan.</h2>
                <p>
                  Ask about cost levers, token usage, or ways to optimize this
                  workflow.
                </p>
              </div>
            </div>
            <div className="qa-chat">
              <div className="answer-bubble">{answer}</div>
              <form onSubmit={askQuestion}>
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="e.g. How can I get this under $10 a month?"
                  aria-label="Ask about this estimate"
                />
                <button aria-label="Send question">
                  <Icon name="send" size={17} />
                </button>
              </form>
              <div className="suggestions">
                <button
                  onClick={() => setQuestion("Where can I save the most?")}
                >
                  Where can I save the most?
                </button>
                <button onClick={() => setQuestion("Explain the token usage")}>
                  Explain token usage
                </button>
              </div>
            </div>
          </section>

          <footer>
            <span>Model rates are configurable planning assumptions</span>
            <span>
              Estimates exclude platform subscriptions and human editorial
              costs.
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
