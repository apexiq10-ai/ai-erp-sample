// All narrative copy lives here, transcribed verbatim from ../COPY.md (the
// approved copy deck). `npm run check:copy` fails on any string that is not in
// the deck, on any em or en dash, and on any phrase the claim discipline bans.
// Layout files never carry narrative copy.

export type Mode = "night" | "paper";

export type SectionMeta = {
  id: string;
  index: string;
  subject: string;
  part: "main" | "appendix";
  steps: number; // builds after arrival (0 = static)
  modes: Mode[]; // mode at each step; the last entry repeats
  read: number; // resting build in reading (scroll) mode
  scrub?: boolean; // one viewport of scroll per build; the build follows the scroll
};

/* ------------------------------------------------------------ SITE */

export const site = {
  name: "AI-native ERP",
  title: "AI-native ERP · The ledger that shows its work.",
  description: "Your company runs in real time. Your ERP runs on hindsight. A go-to-market plan for an AI-native ERP.",
  author: "A plan by Arthur Suvorov",
  system: "System of proof",
  note: "An independent PMM concept",
  motion: "Motion",
  on: "On",
  off: "Off",
  index: "Index",
  story: "The story",
  keys: "Scroll · swipe · arrow keys",
  footer: "The ledger that shows its work",
};

/* ------------------------------------------------------------ 01 OPEN */

export const s01 = {
  line1: ["Your company runs", "in real time."],
  line2: ["Your ERP runs", "on hindsight."],
  kicker: "Then the month ends. And the digging starts.",
  // The pointer closes the month: real time at one end, hindsight at the other.
  gesture: { pointer: "Move across the month to close it.", touch: "Drag across the month to close it." },
  ends: ["Real time", "Hindsight"],
  slider: "Close the month",
  hint: "Press → or scroll",
  tag: "Illustrative motion · not ledger data",
  day: "Day",
};

/* ------------------------------------------------------------ 02 PRODUCT */

export const s02 = {
  meet: "Meet the AI-native ERP.",
  title: ["The ledger that", "shows its work."],
  sub: "Event in. Evidence out.",
  // One shared active stage drives the label, the caption and the scene.
  steps: [
    { word: "Connect", line: "Every source lands the moment it happens.", caption: "Source systems and events enter the ledger." },
    { word: "Reason", line: "Agents do the digging. Once.", caption: "Accounting logic processes the event and proposes an entry." },
    { word: "Prove", line: "Source, reasoning, approver. On every number.", caption: "Source, entry, review and reported result become inspectable." },
  ],
  stagesLabel: "How it works",
  annotation: "Reason is where the agents work.",
  hint: "Click any entry. It shows its work.",
  trace: "Trace an entry",
  sources: ["Billing", "Bank", "Payroll", "CRM", "Usage"],
};

/* Per-entry illustrative values. Any entry in the world can be traced; its
   details are generated from these lists and labelled as illustrative. */
export const inspector = {
  title: "Journal entry",
  rows: ["Source", "Entry", "Agent", "Approver"],
  tag: "Illustrative · not customer data",
  close: "Close",
  sources: ["Stripe payout", "Invoice issued", "Usage record", "Payroll run", "Bank fee", "Intercompany transfer"],
  accounts: ["Cash ← Clearing", "AR ← Revenue", "Deferred revenue ← Revenue", "Payroll expense ← Cash", "Bank fees ← Cash", "Due from entity ← Cash"],
  reasons: ["Matched to 41 charges", "Recognized under policy RR-02", "Accrued from metered usage", "Allocated by headcount", "Matched to statement line", "Eliminated on consolidation"],
  approvers: ["Controller", "Senior accountant", "Assistant controller"],
  results: ["Cash, September close", "Revenue, September: $4.28M", "Revenue, September: $4.28M", "Payroll expense, September close", "Bank fees, September close", "Consolidated balance sheet, September"],
};

/* The proof model: one entry, five steps. Shared by the Source / Entry /
   Close controls, the trace markers in the scene, and the step panel. */
export const proof = {
  tag: "Illustrative workflow and data",
  instruction: "Select a layer to inspect the entry.",
  traceTitle: "Trace an entry",
  back: "Back",
  next: "Next",
  exit: "Exit",
  stepWord: "Step",
  dayWord: "Day",
  steps: [
    { id: "source-event", label: "Source event", evidence: "Event", title: "It starts with something real.", explanation: "An invoice, a payout or a usage record arrives from the system where it happened." },
    { id: "accounting-logic", label: "Accounting logic", evidence: "Rule", title: "The rule is written down.", explanation: "An agent applies your documented policy and records why it chose this treatment." },
    { id: "journal-entry", label: "Journal entry", evidence: "Entry", title: "The entry it produced.", explanation: "The proposed entry posts to the ledger, linked to its source and its rule." },
    { id: "human-review", label: "Human review", evidence: "Reviewer", title: "A person signs it.", explanation: "The accountable review and decision stay visible." },
    { id: "reporting-result", label: "Reporting result", evidence: "Result", title: "It rolls up to the number.", explanation: "The approved entry lands in the reported line, so the close confirms instead of reconstructs." },
  ],
  viewsLabel: "Inspect",
  views: [
    { id: "source", label: "Source", target: "source-event", title: "Where it came from.", explanation: "Every entry keeps a link to the event or document that created it.", benefit: "Provenance without a spreadsheet hunt." },
    { id: "entry", label: "Entry", target: "journal-entry", title: "What it became.", explanation: "The journal entry sits next to its source and the rule that produced it.", benefit: "Review the logic, not just the number." },
    { id: "close", label: "Close", target: "reporting-result", title: "What it adds up to.", explanation: "Approved entries roll straight into the reported line.", benefit: "The close confirms. It doesn't reconstruct." },
  ],
  benefitLabel: "Why it matters",
};

/* ------------------------------------------------------------ 03 WEDGE */

export const s03 = {
  eyebrow: "Where I would start",
  title: "One close.",
  build: ["Less archaeology.", "More judgment."],
  today: {
    label: "Today",
    tasks: ["Export", "Match", "Accrue", "Allocate", "Recognize", "Eliminate", "Tie out"],
    decision: "Controller sign-off",
  },
  // The stack is one entry's journey. Layer names and "what it is" come from
  // the proof model (proof.steps), so 02 and 03 describe the same five layers.
  event: { name: "Event", lines: ["The month-end close.", "Twelve a year. Already timed. The controller holds the pen."] },
  stackLabel: "One entry, layer by layer",
  instruction: "Select a layer to follow one entry.",
  overview: "Overview",
  nextLayer: "Next layer",
  facts: ["What it is", "What happened", "Why it matters"],
  layers: [
    { happened: "Captured from billing, bank and payroll as it lands, not exported at month end.", why: "Provenance without a spreadsheet hunt.", takes: ["Export"] },
    { happened: "Coded, accrued, allocated and recognized as entries land. Your policies, not ours.", why: "The treatment is written down before anyone asks for it.", takes: ["Accrue", "Allocate", "Recognize"] },
    { happened: "Bank, subledger and intercompany match on arrival. Not on day four.", why: "Review the logic, not just the number.", takes: ["Match", "Eliminate"] },
    { happened: "The controller still signs.", why: "We retire the archaeology, not the accountant.", takes: ["Controller sign-off"] },
    { happened: "Schedules and flux explanations arrive drafted. Evidence attached.", why: "The close confirms. It doesn't reconstruct.", takes: ["Tie out"] },
  ] as { happened: string; why: string; takes: string[] }[],
  tags: ["Inference · step mapping", "Claimed · capability as described by the company"],
};

/* ------------------------------------------------------------ 04 INSIGHT */

export const s04 = {
  topline: "The product insight",
  title: ["All-nighters", "don't scale.", "Ledgers do."],
  support: "One fast close takes a long weekend. Three times the volume takes infrastructure.",
  explore: ["Explore the", "evidence"],
  side: "Fig. 04 / Every number, all the way down",
  tag: "Illustrative motion · not product footage",
  detail: {
    label: "04 / The core sample",
    close: "Close",
    head: ["One number.", "Five layers.", "No gaps."],
    note: "Illustrative visualization, not customer data.",
    next: "Trace next layer",
    back: "Back to the number",
    layers: [
      { short: "Report", kicker: "Reported line", value: "$4.28M", detail: "The figure in the report. The question is what sits beneath it." },
      { short: "Entries", kicker: "Journal entries", value: "184 entries", detail: "The entries that make up the reported line, available for review." },
      { short: "Sources", kicker: "Source events", value: "Billing + bank", detail: "The original activity behind the entries. Follow the trail back." },
      { short: "Proposal", kicker: "Agent proposal", value: "Policy applied", detail: "The proposed treatment and the rule used to reach it." },
      { short: "Approval", kicker: "Human approval", value: "Controller sign-off", detail: "The accountable review and decision stay visible." },
    ],
    claimed: "Claimed · every entry traced to its source, every agent action recorded, human approval where it matters",
  },
};

/* ------------------------------------------------------------ 05 BUYERS */

export const s05 = {
  title: ["Same ledger.", "Different stakes."],
  labels: ["Who", "What makes it hard", "Trigger", "How we say it"],
  roles: [
    {
      role: "Controller",
      quote: "Give me the last week of the month back.",
      stakes: "Close calendar · team capacity",
      buys: "Buys back the last week of every month.",
      hard: ["Days of tie-out before any judgment", "Spreadsheets wrapped around the ERP", "A close calendar that slips with volume"],
      trigger: ["The close slips past day 10", "A new entity or revenue stream", "A key accountant leaves mid-close"],
      say: ["Reconciliation runs as transactions land", "Flux arrives drafted, with evidence", "You keep the pen"],
    },
    {
      role: "CFO",
      quote: "Don't make me hire to keep up.",
      stakes: "Leverage · board confidence · IPO path",
      buys: "Buys leverage and confidence.",
      hard: ["Finance headcount tracking revenue", "A board that wants numbers sooner", "An IPO path on a stack built for a smaller company"],
      trigger: ["A fundraise or IPO plan", "The board wants a faster package", "Next year's hiring plan"],
      say: ["Finance scales slower than the business", "Current numbers, not last month's", "Mercor: past $2B ARR, three people in finance"],
      claimedSay: 2,
    },
    {
      role: "Chief Accounting Officer",
      quote: "If I can't trace it, I won't sign it.",
      stakes: "Revenue recognition · SOX · audit",
      buys: "Buys defensibility.",
      hard: ["Usage and multi-element revenue under ASC 606", "Explaining every number to the auditor", "SOX on a stack held together by spreadsheets"],
      trigger: ["A first Big Four audit", "SOX readiness", "A new pricing model"],
      say: ["Every number traces to source, policy and approver", "Agents follow your documented policies", "Your auditor gets something to test"],
    },
    {
      role: "Finance Systems",
      quote: "I'm done babysitting middleware.",
      stakes: "Integrations · security · data model",
      buys: "Buys fewer seams.",
      hard: ["Scripts between billing, CRM, banks and the GL", "Every integration is a control to test", "Security review for anything with AI in it"],
      trigger: ["An ERP renewal", "An integration breaks mid-close", "A billing or CRM migration"],
      say: ["Native integrations replace middleware", "One data model for people and agents", "Agents connect to Salesforce, Snowflake and Claude"],
      claimedSay: 2,
    },
  ],
  claimed: "Claimed",
  footer: "One ledger. Four reasons to switch.",
  tag: "Persona map · hypothesis to validate",
};

/* ------------------------------------------------------------ 06 SEQUENCE */

export const s06 = {
  title: ["Collect the receipts.", "Then turn up the volume."],
  phases: [
    { n: "01", name: "Harvest", line: "The proof is already in the building.", beat: "Evidence is collected and organized.", art: "harvest", items: ["20 to 30 close baselines", "Before and after data", "Proof library", "Message tests"] },
    { n: "02", name: "Prove", line: "Your last close, on our ledger.", beat: "The evidence connects into a reviewed, traceable workflow.", art: "prove", items: ["Parallel Close", "Controller sponsor", "Auditor walkthrough", "Tie-out to signed numbers"] },
    { n: "03", name: "Launch", line: "Turn receipts into a category.", beat: "The proof becomes a story the market can see.", art: "launch", items: ["CEO point of view", "State of the Close", "Recon keynote", "Named customer voices", "Seller readiness"] },
    { n: "04", name: "Scale", line: "Surround the market.", beat: "The workflow repeats across volume and entities.", art: "scale", items: ["Vertical playbooks", "Partner co-marketing", "Paid", "Close Club", "Lifecycle", "Advocacy"] },
  ],
  bottom: ["The receipts exist.", "Job one: collect them."],
  now: "Now playing",
};

/* ------------------------------------------------------------ 07 CHANNELS */

export const s07 = {
  title: ["Everywhere a controller looks.", "Except close week."],
  rule: "Days 1 to 7: radio silence. Launches land on days 10 to 20.",
  sub: "One story. Every channel. One ask: bring your last close.",
  navLabel: "You earn channel complexity",
  liveLabel: "Plays live",
  // Plays live is counted from the stage data below, never typed in.
  phases: [
    { n: "01", horizon: "0 to 3 months", name: "Foundational", head: "Find the message that converts.", body: "Start closest to the customer: the field and the profession. Conversion, not reach." },
    { n: "02", horizon: "3 to 12 months", name: "Advancing", head: "Expand what converts.", body: "Add distribution around whatever already produces Parallel Closes." },
    { n: "03", horizon: "12+ months", name: "Mature", head: "Compound the system.", body: "Every channel runs on behavior, proof and the profession. Precision, not activity." },
  ],
  // [play, the phase that switches it on]. Justify's Advancing slot has no
  // supported asset (the TCO model was withdrawn): it stays an open slot,
  // shown muted, and is never counted as live.
  stages: [
    { name: "Recognize", job: "Name the cost of reconstruction", plays: [["CEO point of view", 1], ["State of the Close", 2], ["Analyst relations", 3]] },
    { name: "Justify", job: "Arm the CFO and the board", plays: [["Seller story", 1], ["Migration risk one-pager", 1], ["Open slot", 2, "open"]] },
    { name: "Validate", job: "Clear the auditor and IT", plays: [["Auditor evidence package", 1], ["Security and integration review", 2], ["Customer references", 2]] },
    { name: "Prove", job: "See it on their own close", plays: [["Parallel Close", 1], ["Close Club peer session", 1], ["CPA partner implementation", 3]] },
    { name: "Expand", job: "Earn the next entity", plays: [["Customer success playbooks", 2], ["Feature journey releases", 2], ["Advocacy on the Recon stage", 3]] },
  ] as { name: string; job: string; plays: [string, number, "open"?][] }[],
  closeWeek: "Close week",
  // the buying-journey module: one stage at a time
  journeyLabel: "Buying journey",
  detail: ["Buyer job", "Plays", "Next"],
  live: "Live",
  from: "From",
  openNote: "No supported asset yet",
  nextWorkflow: "The next workflow",
};

/* ------------------------------------------------------------ 08 MEASURE */

export const s08 = {
  title: ["Impressions don't", "close the books."],
  title2: "Behavior does.",
  channels: [
    { name: "Use", q: "Are they running the books in the AI-native ERP?", items: ["Active finance users", "Agent actions per close", "Workflows run by agents"] },
    { name: "Value", q: "Did the close actually change?", items: ["Days to close", "Hours per close", "Manual journal entries", "Reconciling items"] },
    { name: "Trust", q: "Do they trust it enough to sign?", items: ["Proposals accepted, edited, rejected", "Post-close adjustments", "Auditor request turnaround"] },
    { name: "Commercial", q: "Does it move pipeline and revenue?", items: ["Parallel Close starts", "Conversion to contract", "Win rate by incumbent", "Cycle time", "Expansion"] },
  ],
  north: "North star: qualified Parallel Close starts.",
  bottom: ["Reach says they heard of us.", "Behavior says the close changed."],
  tag: "Value not set · targets come from the Harvest baselines",
  impressions: "Impressions",
  // What the ledger does for each measure (the 3D scene, in words).
  pick: "Select a measure to see it in the ledger.",
  scenes: [
    "Work keeps entering the ledger and passing through it. Close after close.",
    "A month of reconstruction, compressed into one current, ordered state.",
    "The structure opens. Result, review gate and source in one line of sight.",
    "Changed closes become Parallel Close starts, then pipeline.",
  ],
};

/* ------------------------------------------------------------ 09 CLOSE */

export const s09 = {
  topline: "The next action",
  title: ["Bring", "your last", "close."],
  support: "One closed month. Your signed numbers. An accountable comparison.",
  explore: ["See the", "Parallel Close"],
  side: "Fig. 09 / Let the evidence make the case",
  tag: "Illustrative motion · not product footage",
  detail: {
    label: "09 / The Parallel Close",
    close: "Close",
    head: ["Your close.", "Our ledger.", "One test."],
    note: "Proposed evaluation motion, subject to company approval.",
    next: "Next step",
    again: "Start again",
    lanes: ["Your signed close", "AI-native ERP replay"],
    steps: [
      { short: "Scope", kicker: "01 / Scope", title: "Agree on the test.", detail: "Choose a signed period, a controller sponsor, the inputs, and the definition of a successful tie-out." },
      { short: "Replay", kicker: "02 / Replay", title: "Run it beside them.", detail: "Process the agreed period in parallel. Keep the original close untouched." },
      { short: "Tie out", kicker: "03 / Tie out", title: "Compare the numbers.", detail: "Put AI-native ERP output next to the signed close. Record differences, exceptions, and time spent." },
      { short: "Decide", kicker: "04 / Decide", title: "Let proof decide.", detail: "Review the evidence with finance and the auditor. The controller makes the call." },
    ],
  },
  appendix: "Appendix",
  sign: "The ledger that shows its work.",
};

/* ------------------------------------------------------------ APPENDIX */

type Apx = { title: string; headline: string; narrative: string[]; exhibit: string; implication: string };

export const a1: Apx & {
  cols: string[];
  rows: { cap: string; v: string[] }[];
  legend: string[];
  source: string;
} = {
  title: "Category convergence",
  headline: "AI-native is table stakes. Win on proof at the customer's complexity.",
  narrative: [
    "Every ERP now ships an assistant. AI in the product no longer separates anyone.",
    "What still separates this AI-native ERP is architecture: agents inside a real-time ledger, and an evidence chain that never crosses a seam.",
    "The hard objection: why replace the ERP at all? Because every seam between a ledger and the tools around it is a gap your auditor has to test.",
  ],
  exhibit: "Capability by architecture",
  cols: ["Capability", "Legacy ERP + AI", "AI layer on an ERP", "Other AI-native ERPs", "This AI-native ERP"],
  rows: [
    { cap: "Conversational assistant", v: ["Vendor-announced", "Yes", "Claimed", "Claimed"] },
    { cap: "Agents assist with close tasks", v: ["Vendor-announced", "Core offer", "Claimed", "Claimed"] },
    { cap: "Is the general ledger", v: ["Yes", "No, sits on top", "Yes", "Yes"] },
    { cap: "Ledger updates continuously", v: ["Not verified", "Inherits the ERP underneath", "Not verified", "Claimed"] },
    { cap: "Agents act inside the posting workflow", v: ["Not verified", "No, outside the ledger", "Not verified", "Claimed"] },
    { cap: "Evidence chain from source to report", v: ["Not verified", "Crosses a seam", "Not verified", "Claimed"] },
    { cap: "Big Four alliance and top CPA firms", v: ["Varies by vendor", "Not verified", "Not verified", "EY alliance; over half of the top 20"] },
  ],
  legend: ["Claimed · stated by the company, not independently demonstrated", "Not verified · no public evidence found; does not mean absent"],
  implication: "Don't lead with AI-native. Lead with proof at your complexity.",
  source: "Public materials reviewed October 2026. Column three: Campfire, DualEntry, Light. Column two: close and agent-layer tools such as Numeric and Truewind. Verify every cell before publishing.",
};

export const a2: Apx & {
  workflows: { name: string; expand: string; ease: string; wedge?: boolean }[];
  criteria: { name: string; why: string }[];
  segments: { order: string; seg: string; why: string; proof: string }[];
  pathLabel: string;
  path: string[];
} = {
  title: "Wedge prioritization",
  headline: "The close is the fastest way to prove value and earn the rest of finance.",
  narrative: [
    "Frequent, measured, and signed by a named person.",
    "This AI-native ERP proves itself on the customer's own numbers without asking anyone to hand judgment to an agent. Revenue recognition, consolidation and reporting follow once the close is trusted.",
  ],
  exhibit: "Expansion potential against ease of proof",
  workflows: [
    { name: "Month-end close", expand: "High", ease: "High", wedge: true },
    { name: "Revenue recognition (ASC 606)", expand: "High", ease: "Medium" },
    { name: "Multi-entity consolidation", expand: "High", ease: "Medium" },
    { name: "AP and prepaids", expand: "Medium", ease: "High, but crowded" },
    { name: "Board and management reporting", expand: "Medium", ease: "Medium" },
    { name: "Close with no human sign-off", expand: "High", ease: "Low" },
  ],
  criteria: [
    { name: "Frequent", why: "Twelve closes a year compound the gain" },
    { name: "Measurable", why: "Days to close is already tracked" },
    { name: "Bounded", why: "The controller's signature keeps accountability explicit" },
    { name: "Replayable", why: "A closed period can be re-run and tied out" },
    { name: "Expandable", why: "A trusted close earns the next workflow" },
  ],
  segments: [
    { order: "Sustain", seg: "AI and high-growth tech", why: "Highest velocity; where the brand was born", proof: "Strong (Claimed)" },
    { order: "Lead", seg: "Pre-IPO and public, leaving NetSuite, Sage or Oracle", why: "Trigger-rich, highest contract value", proof: "Public-company references (Claimed)" },
    { order: "Harvest", seg: "Healthcare and biotech", why: "Traction exists; turn it into named proof", proof: "Function Health (Claimed)" },
    { order: "Open", seg: "Fintech", why: "Highest reconstruction cost", proof: "Hypothesis" },
    { order: "Follow", seg: "Logistics, robotics, defense, services", why: "Named by the company", proof: "Emerging" },
  ],
  pathLabel: "Start with one close. Then earn the rest of finance.",
  path: ["Month-end close", "Revenue recognition", "Consolidation", "Board reporting", "Audit", "IPO"],
  implication: "Start where an AI-native ERP can earn the right to expand.",
};

export const a3: Apx & {
  demand: { role: string; value: string }[];
  permit: { role: string; value: string }[];
  converge: string;
  sides: string[];
} = {
  title: "The ERP buying system",
  headline: "Controllers create demand. Auditors grant permission. Sell to both.",
  narrative: [
    "Controllers and CFOs create the pull; they live the reconstruction every month. None of them can move the general ledger alone.",
    "The auditor, the audit committee, security and the implementation partner ask a different question: can we switch the system of record without risking a reporting period?",
  ],
  exhibit: "Who wants it, who permits it",
  sides: ["Creates demand", "Permits the switch"],
  demand: [
    { role: "Controller", value: "A close without reconstruction" },
    { role: "CFO", value: "Leverage and confidence" },
    { role: "Chief Accounting Officer", value: "Defensibility" },
    { role: "Finance Systems", value: "Fewer seams" },
  ],
  permit: [
    { role: "External auditor", value: "Testable evidence and a clean cutover" },
    { role: "Audit committee", value: "No disruption to reporting" },
    { role: "Security and vendor risk", value: "Access controls, data handling, AI use disclosed" },
    { role: "Implementation partner", value: "A migration they can stand behind" },
  ],
  converge: "A signed migration",
  implication: "Enthusiasm without auditor comfort buys evaluations, not migrations.",
};

export const a4: Apx & {
  today: string[];
  parallel: string[];
  metrics: { name: string; items: string[] }[];
  scale: string[];
  scaleLabel: string;
  hypothesis: string;
} = {
  title: "Parallel Close economics",
  headline: "Run their last close. Tie it to the numbers they already signed.",
  narrative: [
    "The prospect picks its last closed month. The AI-native ERP connects the sources, runs that close and ties it out to the results the controller already signed.",
    "The test isn't speed. It's whether the team reaches the same signed numbers with far less reconstruction, and trusts it enough to do it again.",
  ],
  exhibit: "One close, measured four ways",
  today: ["Export", "Match", "Accrue", "Allocate", "Recognize", "Eliminate", "Tie out", "Sign-off"],
  parallel: ["AI-native continuous close", "Sign-off"],
  metrics: [
    { name: "Efficiency", items: ["Days to close", "Hours per close", "Manual journal entries"] },
    { name: "Quality", items: ["Tie-out variance to signed numbers", "Reconciling items", "Post-close adjustments"] },
    { name: "Trust", items: ["Agent proposals accepted", "Edits and rejections", "Controller confidence"] },
    { name: "Adoption", items: ["Users active after the close", "Agent actions per close", "Decision to migrate"] },
  ],
  scaleLabel: "Scale when",
  scale: ["Ties out to signed numbers", "Material time reduction", "Repeat use", "Auditor walkthrough complete"],
  hypothesis: "Hypothesis · scope, duration and fee are for Implementation, Sales and Finance to set. Every Parallel Close must leave a measured before and after.",
  implication: "Build the ROI story from measured closes, not models.",
};

export const a5: Apx & {
  timeline: { when: string; what: string }[];
  rule: string;
  ruleLabel: string;
  assets: { stage: string; asset: string; signal: string }[];
} = {
  title: "Integrated launch journey",
  headline: "Six plays at launch. Twelve by month twelve. Fifteen at maturity.",
  narrative: [
    "One story and one next action, the whole way through. Channels are added when the evidence for them exists, not when the budget does.",
    "Recon is the annual category moment. Close Club carries the conversation in between.",
  ],
  exhibit: "When each layer switches on",
  timeline: [
    { when: "Month 0", what: "Harvest: baselines, proof library, message tests" },
    { when: "Months 1 to 3", what: "Foundational: 6 plays. Prove the message." },
    { when: "Months 3 to 12", what: "Advancing: 12 plays. Expand what converts." },
    { when: "Month 12+", what: "Mature: 15 plays. Compound the system." },
  ],
  assets: [
    { stage: "Recognize", asset: "Category essay", signal: "Target-account engagement" },
    { stage: "Justify", asset: "Migration risk one-pager", signal: "Opportunity created" },
    { stage: "Validate", asset: "Auditor evidence package", signal: "Evaluation reached" },
    { stage: "Prove", asset: "Parallel Close", signal: "Parallel Close start" },
    { stage: "Expand", asset: "Next-workflow play", signal: "Expansion" },
  ],
  ruleLabel: "Close-calendar rule",
  rule: "No controller-facing outreach on days 1 to 7. Launches, webinars and sends land on days 10 to 20.",
  implication: "Add a channel only when the evidence for it exists.",
};

export const a6: Apx & {
  gates: { name: string; items: string[] }[];
  principle: string;
  not: string;
  never: string[];
  neverLabel: string;
} = {
  title: "Launch readiness",
  headline: "No claim ships without product, customer, auditor and field evidence.",
  narrative: [
    "The same gate governs every vertical. When the evidence isn't there, the claim narrows. It doesn't get louder.",
    "The zero-day close is the direction, not the promise. Measured days are the promise.",
  ],
  exhibit: "The four-part gate",
  gates: [
    { name: "Product", items: ["Close performs at segment volume", "Evidence chain visible end to end", "Approval points defined", "Telemetry supports measurement"] },
    { name: "Customer", items: ["Harvested baselines", "Measured improvement", "Repeat closes", "Referenceable customer"] },
    { name: "Auditor", items: ["Evidence package", "Partner-firm walkthrough", "Model-use disclosure", "Cutover guidance"] },
    { name: "Field", items: ["Seller story", "Migration risk one-pager", "Demo on sample data", "Parallel Close playbook"] },
  ],
  principle: "Launch = Product + Customer + Auditor + Field.",
  not: "Not: Launch = Announcement ready.",
  neverLabel: "We never say",
  never: ["Zero-day close, guaranteed", "Audit-ready", "Audit-proof", "No accountants needed", "Autonomous accounting", "Time savings without a named customer"],
  implication: "Start with one close. Earn each vertical the same way.",
};

export const a7: Apx & {
  plumbingLabel: string;
  plumbing: string[];
  loopCols: string[];
  loops: { name: string; reads: string; decides: string; does: string; owner: string; cadence: string }[];
  reactivationLabel: string;
  steps: string[];
  triggerCols: string[];
  triggers: { stalled: string; missing: string; after: string; reason: string; play: string; success: string }[];
  eventsNote: string;
  guardrailsLabel: string;
  guardrails: string[];
  hypothesis: string;
} = {
  title: "PMM loops",
  headline: "Build loops, not campaigns. Start with the signups that went quiet.",
  narrative: [
    "A campaign ends. A loop reads a signal, makes a decision, acts, and learns from the answer, every cycle.",
    "Three loops share one event stream: segmentation, go-to-market and reactivation. Reactivation comes first. A dormant signup already raised its hand, and the product data shows exactly where it stopped.",
    "Rules first, models later. A rule an operator can read beats a score nobody can explain to a controller.",
  ],
  exhibit: "Three loops, one event stream",
  plumbingLabel: "Plumbing",
  plumbing: [
    "Product events and CRM activity land in the warehouse",
    "Rules assign segment, stall point and reason to every account",
    "A reverse sync writes them back to the CRM and the lifecycle tool",
    "Every send, reply and session returns as an event",
  ],
  loopCols: ["Loop", "Reads", "Decides", "Does", "Owner", "Cadence"],
  loops: [
    { name: "Segmentation", reads: "Incumbent ERP, entity count, billing model, funding stage, product events", decides: "Segment, fit tier and buying trigger", does: "Routes the account to its message and play", owner: "PMM with RevOps", cadence: "Weekly" },
    { name: "Go-to-market", reads: "Message tests, channel touches, stage velocity", decides: "Keep, change or stop each play", does: "Shifts the play mix and budget", owner: "PMM with Demand", cadence: "Monthly" },
    { name: "Reactivation", reads: "Where a signup stopped, and for how long", decides: "Why it stopped", does: "Sends one matched play, timed to the close calendar", owner: "PMM with Lifecycle and Sales", cadence: "Weekly" },
  ],
  reactivationLabel: "The reactivation loop",
  steps: ["Detect", "Diagnose", "Act", "Measure", "Learn"],
  triggerCols: ["Stalled at", "Missing event", "After", "Likely reason", "Matched play", "Success event"],
  triggers: [
    { stalled: "Signed up", missing: "source_connected", after: "7 days", reason: "Integration effort", play: "Integration walkthrough for Finance Systems", success: "source_connected" },
    { stalled: "Sources connected", missing: "close_run", after: "14 days", reason: "No clear first step", play: "Parallel Close scoping: bring your last close", success: "parallel_close_start" },
    { stalled: "Close run", missing: "proposal_reviewed", after: "10 days", reason: "Trust in agent proposals", play: "Auditor evidence package, Close Club peer session", success: "proposal_reviewed" },
    { stalled: "Active, then quiet", missing: "session", after: "Days 1 to 7", reason: "Close week", play: "Hold. State of the Close on day 10", success: "session" },
    { stalled: "Outside the core segments", missing: "fit_tier", after: "At signup", reason: "Fit", play: "Partner route and light nurture", success: "partner_referral" },
  ],
  eventsNote: "Illustrative event names",
  guardrailsLabel: "Guardrails",
  guardrails: ["No outreach in close week", "One play per account at a time", "Every message cites an evidence asset, never a promise", "A person owns every send to a controller"],
  hypothesis: "Hypothesis · thresholds and plays are starting points, to be set and tested against product data.",
  implication: "Build reactivation first: the signal already exists, and the buyer has already said yes once.",
};

export const apxLabels = { exhibit: "Exhibit", expansion: "Expansion", ease: "Ease of proof", prev: "Previous", next: "Next" };

export const appendixList = [a1, a2, a3, a4, a5, a6, a7].map((a, k) => ({
  id: `a${k + 1}`,
  index: `A${k + 1}`,
  title: a.title,
  headline: a.headline,
}));

/* ------------------------------------------------------------ REGISTRY */

export const sections: SectionMeta[] = [
  { id: "s01", index: "01", subject: "Hindsight", part: "main", steps: 1, modes: ["night"], read: 0 },
  { id: "s02", index: "02", subject: "Meet the AI-native ERP", part: "main", steps: 2, modes: ["night"], read: 0, scrub: true },
  { id: "s03", index: "03", subject: "The wedge", part: "main", steps: 5, modes: ["night"], read: 0 },
  { id: "s04", index: "04", subject: "All-nighters don't scale", part: "main", steps: 0, modes: ["night"], read: 0 },
  { id: "s05", index: "05", subject: "Buyers", part: "main", steps: 5, modes: ["night"], read: 5 },
  { id: "s06", index: "06", subject: "Sequence", part: "main", steps: 4, modes: ["night"], read: 4 },
  { id: "s07", index: "07", subject: "Channels", part: "main", steps: 3, modes: ["night"], read: 1 },
  { id: "s08", index: "08", subject: "Measurement", part: "main", steps: 5, modes: ["night"], read: 1 },
  { id: "s09", index: "09", subject: "Bring your last close", part: "main", steps: 0, modes: ["night"], read: 0 },
  { id: "apx", index: "A", subject: "Appendix", part: "appendix", steps: 6, modes: ["paper"], read: 0 },
];
