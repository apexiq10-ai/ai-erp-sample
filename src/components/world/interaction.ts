/* Interaction contracts for the 3D scenes, as pure functions (no imports,
   so `npm test` can load this file on its own).

   01 · the month. One number, the target progress (0 = real time, 1 = the
   month-end ridge), is the only input state. The pointer, the keys and the
   slider all write it; the render loop eases the rendered progress toward it
   with elapsed time, and the scene, the camera and the hindsight line all
   read the rendered value. The deck's build for 01 is derived from the
   target with hysteresis, so → still means "close the month, then move on".

   03 · the stack. One number, the deck's build for 03, is the selected
   layer: 0 is the overview, 1 to 5 are the five layers of one entry. Mesh
   picking, hotspots, the layer list, keys and Escape all resolve to it. */

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};

/* Frame-rate independent exponential approach: the same elapsed time gives
   the same result whether it arrives in one frame or ten. */
export const damp = (cur: number, target: number, rate: number, dt: number) => target + (cur - target) * Math.exp(-rate * dt);

/* ------------------------------------------------------------- 01 */

// A mouse or pen maps its position across the middle of the frame; the
// edges are dead zones so both endpoints are easy to hold.
export const OPEN_BAND = [0.14, 0.86] as const;
export const pointerToProgress = (x: number, width: number) => clamp01((x / width - OPEN_BAND[0]) / (OPEN_BAND[1] - OPEN_BAND[0]));
// Touch drags relatively: 70% of the width is the whole month.
export const dragToProgress = (p0: number, dx: number, width: number) => clamp01(p0 + dx / (width * 0.7));

// Build 1 (the ridge) holds above 0.6 and lets go below 0.4.
export function openStepFor(target: number, step: number): 0 | 1 {
  if (step === 0) return target > 0.6 ? 1 : 0;
  return target < 0.4 ? 0 : 1;
}

// Where each entry is between the stream (0) and the ridge (1) at rendered
// progress p. Entries leave the stream at staggered moments, so midway the
// frame shows both: work still moving, and a pile already forming.
export const OPEN_SPREAD = 0.55;
export const entryBlend = (p: number, seed: number) => smooth((p - seed * OPEN_SPREAD) / (1 - OPEN_SPREAD));

// The hindsight line reveals between these two points of rendered progress.
export const revealAt = (p: number) => clamp01((p - 0.22) / 0.56);

/* ------------------------------------------------------------- 03 */

export const STACK_LAYERS = 5;
export const STACK_BASE = 450; // entries 0..449 are the ledger the stack stands on
export const STACK_PER = 90; // 3 rows of 30 per layer

// The layer an entry belongs to, or -1 for the ledger underneath.
export const layerOfEntry = (i: number) => (i < STACK_BASE ? -1 : Math.min(STACK_LAYERS - 1, Math.floor((i - STACK_BASE) / STACK_PER)));
// The deck's build ↔ the selected layer.
export const layerOfStep = (step: number) => (step >= 1 && step <= STACK_LAYERS ? step - 1 : -1);
export const stepOfLayer = (layer: number) => (layer >= 0 && layer < STACK_LAYERS ? layer + 1 : 0);
