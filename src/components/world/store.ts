import { useSyncExternalStore } from "react";
import { initialProof, proofReducer, type ProofAction, type ProofState } from "@/components/proof/model";

/* The state the page shares with the 3D scene: the proof interaction on 02
   (Source / Entry / Close and the five-step trace). Hover stays in the scene. */

let state: ProofState = initialProof;
const subs = new Set<() => void>();

export const worldStore = {
  get: () => state,
  dispatch(a: ProofAction) {
    const next = proofReducer(state, a);
    if (next === state) return;
    state = next;
    subs.forEach((f) => f());
  },
  sub(f: () => void) {
    subs.add(f);
    return () => {
      subs.delete(f);
    };
  },
};

export const useWorld = () => useSyncExternalStore(worldStore.sub, worldStore.get, worldStore.get);

/* Trace markers are buttons in the page; the scene positions them on the
   ledger layers every frame through this registry. */
export const markerEls: (HTMLElement | null)[] = [];

/* A small value store: one value, change notifications, no reducer. */
function cell<T>(init: T) {
  let v = init;
  const s = new Set<() => void>();
  return {
    get: () => v,
    set(n: T) {
      if (Object.is(n, v)) return;
      v = n;
      s.forEach((f) => f());
    },
    sub(f: () => void) {
      s.add(f);
      return () => void s.delete(f);
    },
  };
}

/* 01 · the month. `target` is the only input state (see interaction.ts);
   `touched` hides the gesture hint after the first real interaction. The
   rendered progress lives in the render loop and is written straight to
   the page (a CSS variable and the slider), never into React state. */
export const openTarget = cell(0);
export const openTouched = cell(false);
export const openEls: { section: HTMLElement | null; slider: HTMLInputElement | null } = { section: null, slider: null };

/* 03 · the stack. Selection is the deck's build for 03; hover (pointer over
   a layer, or focus on its control) is shared here so the mesh, the
   hotspots and the list light the same layer. -1 is nothing. */
export const stackHover = cell(-1);
export const hotspotEls: (HTMLElement | null)[] = [];
export const useStackHover = () => useSyncExternalStore(stackHover.sub, stackHover.get, stackHover.get);

/* 07 · the selected buying-journey stage (0 Recognize .. 4 Expand). One
   value: the stage rail, the detail area, the column highlight, the floor
   arc and the play labels in the scene all read it. */
export const journeyStage = cell(0);
export const useJourney = () => useSyncExternalStore(journeyStage.sub, journeyStage.get, journeyStage.get);
