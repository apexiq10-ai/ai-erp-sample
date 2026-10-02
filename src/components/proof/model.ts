/* The proof interaction, as data and one reducer.
   source-event → accounting-logic → journal-entry → human-review → reporting-result

   02 has one authoritative active stage, the deck's build for 02:
   Connect (0), Reason (1), Prove (2). It drives the stage controls, the 3D
   scene and the explainer; the explainer reads its rows from STAGE_ROWS.
   The trace (five steps, markers on the layers, the step panel) is a
   separate mode with its own state below. */

export const STEP_IDS = ["source-event", "accounting-logic", "journal-entry", "human-review", "reporting-result"] as const;
export type StepId = (typeof STEP_IDS)[number];

export const STAGES = ["connect", "reason", "prove"] as const;
export const clampStage = (n: number) => Math.max(0, Math.min(STAGES.length - 1, Math.round(n)));
// What the explainer shows at each stage: the proof view it explains, and
// its detail rows (-1 is the source system; 0..4 index the steps' evidence).
export const STAGE_VIEW = ["source", "entry", "close"] as const;
export const STAGE_ROWS: readonly (readonly number[])[] = [
  [-1, 0], // Connect: where it came from
  [0, 1, 2], // Reason: event, rule, entry
  [2, 3, 4], // Prove: entry, reviewer, reported result
];

export type ProofState = {
  tracing: boolean; // is the five-step trace open
  step: number; // active trace step, 0..4
  entry: number | null; // the traced entry; null means the default specimen
};

export type ProofAction = { type: "open"; entry?: number | null } | { type: "step"; step: number } | { type: "next" } | { type: "back" } | { type: "exit" } | { type: "reset" };

export const initialProof: ProofState = { tracing: false, step: 0, entry: null };

const LAST = STEP_IDS.length - 1;
const clamp = (n: number) => Math.max(0, Math.min(LAST, Math.round(n)));

export function proofReducer(s: ProofState, a: ProofAction): ProofState {
  switch (a.type) {
    case "open":
      // Opening (or reopening) always restarts on the first step.
      return { ...s, tracing: true, step: 0, entry: a.entry ?? null };
    case "step":
      return s.tracing ? { ...s, step: clamp(a.step) } : s;
    case "next":
      return s.tracing && s.step < LAST ? { ...s, step: s.step + 1 } : s;
    case "back":
      return s.tracing && s.step > 0 ? { ...s, step: s.step - 1 } : s;
    case "exit":
      return s.tracing ? { ...s, tracing: false, step: 0, entry: null } : s;
    case "reset":
      return initialProof;
  }
}

/* Illustrative evidence for one entry, one value per step. Values are drawn
   from the content lists by the entry's index, so any entry can be traced. */
export type Lists = { sources: string[]; accounts: string[]; reasons: string[]; approvers: string[]; results: string[] };

export function evidenceFor(entry: number, lists: Lists, cols: number, dayWord: string): string[] {
  const k = entry % lists.sources.length;
  const day = (entry % cols) + 1;
  return [
    `${lists.sources[k]} · ${dayWord} ${day}`,
    lists.reasons[k],
    `JE ${String(entry).padStart(4, "0")} · ${lists.accounts[k]}`,
    lists.approvers[entry % lists.approvers.length],
    lists.results[k],
  ];
}
