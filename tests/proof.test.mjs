// Focused tests for the proof interaction's state transitions.
// The model is TypeScript; it is transpiled in memory with the project's
// own compiler, so no extra test tooling is needed: `npm test`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const src = readFileSync(new URL("../src/components/proof/model.ts", import.meta.url), "utf8");
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const m = await import(`data:text/javascript,${encodeURIComponent(js)}`);
const { proofReducer: r, initialProof: init, evidenceFor, STEP_IDS, STAGES, STAGE_VIEW, STAGE_ROWS, clampStage } = m;

test("the model is source-event to reporting-result, five steps", () => {
  assert.deepEqual(STEP_IDS, ["source-event", "accounting-logic", "journal-entry", "human-review", "reporting-result"]);
});

test("02: one stage value maps to one view and one set of rows", () => {
  assert.deepEqual(STAGES, ["connect", "reason", "prove"]);
  assert.deepEqual(STAGE_VIEW, ["source", "entry", "close"]);
  assert.equal(STAGE_ROWS.length, 3);
  // every row is the source system or a real step, and the stages move up the chain
  for (const rows of STAGE_ROWS) for (const k of rows) assert.ok(k >= -1 && k < STEP_IDS.length);
  assert.ok(Math.max(...STAGE_ROWS[0]) < Math.max(...STAGE_ROWS[1]) && Math.max(...STAGE_ROWS[1]) < Math.max(...STAGE_ROWS[2]));
  // rapid or out-of-range requests resolve to a real stage
  assert.equal(clampStage(-2), 0);
  assert.equal(clampStage(7), 2);
  let stage = 0;
  for (const s of [2, 0, 1, 2, 1]) stage = clampStage(s);
  assert.equal(stage, 1, "the last request wins");
});

test("opening a trace activates step one; reopening restarts", () => {
  let s = r(init, { type: "open" });
  assert.equal(s.tracing, true);
  assert.equal(s.step, 0);
  s = r(r(s, { type: "next" }), { type: "next" });
  assert.equal(s.step, 2);
  s = r(s, { type: "open", entry: 41 });
  assert.equal(s.step, 0, "reopen restarts at step one");
  assert.equal(s.entry, 41);
});

test("Next, Back and direct selection stay in range", () => {
  let s = r(init, { type: "open" });
  assert.equal(r(s, { type: "back" }), s, "Back on step one does nothing");
  for (let k = 0; k < 9; k++) s = r(s, { type: "next" });
  assert.equal(s.step, 4, "Next stops at the reporting result");
  assert.equal(r(s, { type: "step", step: 99 }).step, 4);
  assert.equal(r(s, { type: "step", step: -3 }).step, 0);
  assert.equal(r(s, { type: "step", step: 3 }).step, 3);
});

test("steps cannot move while the trace is closed", () => {
  assert.equal(r(init, { type: "next" }), init);
  assert.equal(r(init, { type: "step", step: 3 }), init);
});

test("Exit closes and clears the entry", () => {
  let s = r(init, { type: "open", entry: 7 });
  s = r(s, { type: "exit" });
  assert.equal(s.tracing, false);
  assert.equal(s.step, 0);
  assert.equal(s.entry, null);
});

test("evidence gives one value per step for any entry", () => {
  const lists = { sources: ["A", "B"], accounts: ["a", "b"], reasons: ["ra", "rb"], approvers: ["X", "Y", "Z"], results: ["Ra", "Rb"] };
  const ev = evidenceFor(31, lists, 30, "Day");
  assert.equal(ev.length, 5);
  assert.deepEqual(ev, ["B · Day 2", "rb", "JE 0031 · b", "Y", "Rb"]);
});
