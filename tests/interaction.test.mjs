// Interaction contracts for 01 (the month) and 03 (the stack).
// interaction.ts has no imports, so it is transpiled in memory and loaded
// directly, like the proof model: `npm test`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const src = readFileSync(new URL("../src/components/world/interaction.ts", import.meta.url), "utf8");
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const m = await import(`data:text/javascript,${encodeURIComponent(js)}`);

test("01: pointer position maps across the frame, edges hold the endpoints", () => {
  const W = 1000;
  assert.equal(m.pointerToProgress(0, W), 0);
  assert.equal(m.pointerToProgress(100, W), 0, "left dead zone holds real time");
  assert.equal(m.pointerToProgress(500, W), 0.5);
  assert.equal(m.pointerToProgress(900, W), 1, "right dead zone holds hindsight");
  let last = -1;
  for (let x = 0; x <= W; x += 10) {
    const p = m.pointerToProgress(x, W);
    assert.ok(p >= last, "monotonic");
    last = p;
  }
});

test("01: reversing the pointer reverses the target exactly", () => {
  const W = 1280;
  const path = [200, 400, 700, 1000, 700, 400, 200];
  const out = path.map((x) => m.pointerToProgress(x, W));
  assert.deepEqual(out.slice(0, 3), out.slice(4).reverse());
});

test("01: touch drags relatively and clamps", () => {
  assert.equal(m.dragToProgress(0.2, 0, 1000), 0.2);
  assert.ok(Math.abs(m.dragToProgress(0.2, 350, 1000) - 0.7) < 1e-9);
  assert.equal(m.dragToProgress(0.9, 900, 1000), 1);
  assert.equal(m.dragToProgress(0.1, -900, 1000), 0);
});

test("01: the deck build follows the target with hysteresis, no chatter", () => {
  assert.equal(m.openStepFor(0.55, 0), 0);
  assert.equal(m.openStepFor(0.61, 0), 1);
  assert.equal(m.openStepFor(0.45, 1), 1);
  assert.equal(m.openStepFor(0.39, 1), 0);
  // jitter around the middle never flips the build
  let step = 0;
  for (const p of [0.48, 0.52, 0.49, 0.51, 0.5]) step = m.openStepFor(p, step);
  assert.equal(step, 0);
});

test("01: easing depends on elapsed time, not frame count", () => {
  const run = (fps, seconds) => {
    let v = 0;
    for (let i = 0; i < fps * seconds; i++) v = m.damp(v, 1, 5.5, 1 / fps);
    return v;
  };
  assert.ok(Math.abs(run(30, 0.5) - run(120, 0.5)) < 1e-9);
  assert.ok(run(60, 2) > 0.9999, "settles");
  // interrupting halfway and reversing starts from the rendered value
  let v = run(60, 0.2);
  const mid = v;
  v = m.damp(v, 0, 5.5, 1 / 60);
  assert.ok(v < mid && v > 0, "reverses smoothly from where it is");
});

test("01: every entry is in the stream at 0 and in the ridge at 1", () => {
  for (const seed of [0, 0.25, 0.5, 0.75, 1]) {
    assert.equal(m.entryBlend(0, seed), 0);
    assert.equal(m.entryBlend(1, seed), 1);
  }
  // midway, some entries have arrived and some are still moving
  const mid = [0, 0.2, 0.4, 0.6, 0.8, 1].map((s) => m.entryBlend(0.5, s));
  assert.ok(mid[0] > 0.5 && mid[5] === 0, "a pile forms while the stream still runs");
});

test("01: the hindsight line reveals inside the move, not at its ends", () => {
  assert.equal(m.revealAt(0), 0);
  assert.equal(m.revealAt(0.22), 0);
  assert.equal(m.revealAt(0.78), 1);
  assert.equal(m.revealAt(1), 1);
});

test("03: every stack entry resolves to exactly one of five layers", () => {
  const counts = [0, 0, 0, 0, 0];
  for (let i = 0; i < 900; i++) {
    const k = m.layerOfEntry(i);
    if (i < m.STACK_BASE) assert.equal(k, -1, "the ledger underneath is not a layer");
    else counts[k]++;
  }
  assert.deepEqual(counts, [90, 90, 90, 90, 90]);
});

test("03: the deck build and the selected layer are one identifier", () => {
  assert.equal(m.layerOfStep(0), -1, "build 0 is the overview");
  for (let k = 0; k < m.STACK_LAYERS; k++) assert.equal(m.layerOfStep(m.stepOfLayer(k)), k);
  assert.equal(m.stepOfLayer(-1), 0);
  assert.equal(m.stepOfLayer(9), 0);
  // rapid selection changes: the last one wins, nothing in between sticks
  let step = 0;
  for (const k of [3, 0, 4, 2, 2, 1]) step = m.stepOfLayer(k);
  assert.equal(m.layerOfStep(step), 1);
});
