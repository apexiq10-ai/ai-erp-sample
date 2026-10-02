/* The ledger world. One set of 900 entries (30 days x 30 rows) re-forms for
   every slide: a stream, a month-end ridge, a current ledger, a dig, a block,
   platforms, a calendar ring, columns. Pure functions only: given a slide,
   its build and the clock, where does entry i want to be?
   Everything here is illustrative motion, never ledger data. */

import { s07 } from "@/content";
import { STACK_BASE, STACK_LAYERS, STACK_PER, entryBlend, layerOfEntry, smooth } from "./interaction";

export const COLS = 30;
export const ROWS = 30;
export const N = COLS * ROWS;

export const rand = (k: number) => {
  const x = Math.sin(k * 999.13) * 43758.5453;
  return x - Math.floor(x);
};
const SEED = Array.from({ length: N }, (_, i) => [rand(i + 1), rand(i + 101.3), rand(i + 7.7), rand(i + 55.1)]);

export type Out = {
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  ry: number;
  rz: number;
  tone: number; // silver brightness, 0..1.3
  glow: number; // white emission, 0..1
};

export const TILE = [0.82, 0.08, 0.44] as const;
export const gx = (d: number) => (d - 14.5) * 0.95;
export const gz = (r: number) => (r - 14.5) * 0.55;
const day = (i: number) => i % COLS;
const row = (i: number) => Math.floor(i / COLS);

/* ---------------------------------------------------- precomputed piles */

// 01 · the month-end ridge: every entry heaped onto the last days.
const RIDGE = (() => {
  const cells: { x: number; z: number; w: number }[] = [];
  for (let cx = 0; cx < 6; cx++)
    for (let cz = -6; cz <= 6; cz++) {
      const x = 8.6 + cx * 0.92;
      const z = cz * 0.62;
      cells.push({ x, z, w: Math.exp(-((x - 12.8) ** 2) / 4.2 - z ** 2 / 7) });
    }
  const total = cells.reduce((a, c) => a + c.w, 0);
  const counts = cells.map((c) => Math.floor((c.w / total) * N));
  let left = N - counts.reduce((a, b) => a + b, 0);
  const order = cells.map((c, k) => [c.w, k] as const).sort((a, b) => b[0] - a[0]);
  for (let k = 0; left > 0; k = (k + 1) % order.length, left--) counts[order[k][1]]++;
  const out: { x: number; y: number; z: number; ry: number; rz: number }[] = [];
  const ids = Array.from({ length: N }, (_, i) => i).sort((a, b) => SEED[a][3] - SEED[b][3]);
  let n = 0;
  cells.forEach((c, k) => {
    for (let l = 0; l < counts[k]; l++) {
      const id = ids[n++];
      const s = SEED[id];
      out[id] = { x: c.x + (s[0] - 0.5) * 0.4, y: 0.05 + l * 0.088, z: c.z + (s[1] - 0.5) * 0.3, ry: (s[2] - 0.5) * 0.9, rz: (s[0] - 0.5) * 0.12 };
    }
  });
  return out;
})();

// 01 · when each entry leaves the stream for the ridge: bottom of the pile
// first, with a little randomness so the pile grows rather than fills.
const RIDGE_TOP = Math.max(...RIDGE.map((p) => p.y));
export const OPEN_STAGGER = Float32Array.from({ length: N }, (_, i) => Math.min(1, 0.72 * (RIDGE[i].y / RIDGE_TOP) + 0.28 * SEED[i][0]));
export const OPEN_SPAN = 34;
export const openSpeed = (i: number) => 0.6 + SEED[i][1] * 1.8;
export const openStreamStart = (i: number) => SEED[i][0] * OPEN_SPAN - OPEN_SPAN / 2;

// 03 · the stack: five layers of one entry, standing on the ledger.
//   0 source event · 1 accounting logic · 2 journal entry · 3 human review · 4 reporting result
export const STACK_Y0 = 1.5;
export const STACK_GAP = 1.12;
const STACK_X = 0.4;
const STACK_Z = 1.0;
const STACK_RY = [-0.06, 0.05, -0.03, 0.07, -0.04];
const STACK_DX = [0.0, 0.18, -0.12, 0.1, -0.05];
// The cell the entry passes through on every layer (col 10, row 3).
export const STACK_THREAD_Q = 3 * 15 + 10;
export const stackThread = (k: number) => STACK_BASE + k * STACK_PER + STACK_THREAD_Q;
// The cell each hotspot hangs from (right edge, middle row): read from the
// rendered entries, so hotspots follow the actual scene.
export const stackAnchor = (k: number) => STACK_BASE + k * STACK_PER + 2 * 15 + 14;

// 07 · the fifteen plays, in journey order, with the phase that lights each
export const PLAYS = s07.stages.flatMap((st) => st.plays.map(([name, phase, flag]) => ({ name, phase, open: flag === "open" })));
// 07 · where each play's column stands (local), for labels and links
export const playAt = (b: number, y = 0): [number, number, number] => {
  const a = -Math.PI / 2 + ((b + 0.5) / 15) * Math.PI * 2;
  return [3.5 + Math.cos(a) * 10.2, y, Math.sin(a) * 10.2];
};
// a point on the calendar ring for a day (local)
export const dayAt = (dd: number, y = 0): [number, number, number] => {
  const a = -Math.PI / 2 + (dd / 30) * Math.PI * 2;
  return [3.5 + Math.cos(a) * 6.4, y, Math.sin(a) * 6.4];
};
export const PC_PLAY = PLAYS.findIndex((p) => p.name === "Parallel Close");

// 02 / 05 · the five source systems behind the ledger
export const TOWERS = [-12, -6, 0, 6, 12].map((x) => ({ x, y: 2.6, z: -10.6 }));
// Which source system each illustrative event comes from (inspector.sources
// order → Billing, Bank, Payroll, CRM, Usage).
const SOURCE_TOWER = [1, 0, 4, 2, 1, 1];
export const towerOf = (entry: number) => SOURCE_TOWER[entry % SOURCE_TOWER.length];
// The default traced entry: an invoice that rolls up to reported revenue.
export const SPECIMEN = 17 * COLS + 19;

/* 02 · the tiers. Back rows rise highest, so the ledger steps up and away
   from the camera: 0 source events (front, low) · 1 accounting logic ·
   2 journal entries · 3 review (back, high). */
export const s02Tier = (row: number) => 3 - Math.min(3, Math.floor(row / 7.5));
export const S02_TIERS = [
  { y: 0.35, z: 2.7, mid: 26, chainRow: 26 },
  { y: 2.45, z: 0.9, mid: 18.5, chainRow: 19 },
  { y: 4.55, z: -0.9, mid: 11, chainRow: 11 },
  { y: 6.65, z: -2.7, mid: 3.5, chainRow: 4 },
];
// Eight chains climb the tiers on these days (the same day on every tier).
export const S02_CHAIN_DAYS = [2, 6, 9, 13, 17, 21, 24, 28];
export const s02Chain = (chain: number, tier: number) => S02_TIERS[tier].chainRow * COLS + S02_CHAIN_DAYS[chain];
// The reported line on 02, above and behind the review tier (Prove).
export const S02_RESULT: [number, number, number] = [0, 8.9, -4.2];
// Connect: one event per source system, landing in the flat ledger.
export const CONNECT_FEEDS = [
  { tower: 0, entry: 22 * COLS + 4 },
  { tower: 1, entry: 26 * COLS + 10 },
  { tower: 2, entry: 21 * COLS + 15 },
  { tower: 3, entry: 25 * COLS + 21 },
  { tower: 4, entry: 23 * COLS + 26 },
];
// Each event travels for about four seconds; they are staggered.
export const connectPhase = (k: number, t: number) => (t * 0.24 + k * 0.21) % 1;

/* ------------------------------------------------------------- layouts */

const set = (o: Out, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, ry = 0, tone = 0.8, glow = 0, rz = 0) => {
  o.x = x;
  o.y = y;
  o.z = z;
  o.sx = sx;
  o.sy = sy;
  o.sz = sz;
  o.ry = ry;
  o.rz = rz;
  o.tone = tone;
  o.glow = glow;
};

// The neat, current ledger: every entry in its day and row.
const flat = (o: Out, i: number, tone = 0.82) => set(o, gx(day(i)), 0.045, gz(row(i)), 1, 1, 1, 0, tone);

export type Ctx = {
  section: string;
  step: number;
  t: number;
  jstage: number; // 07: the selected buying-journey stage, 0..4
  tracing: boolean;
  tstep: number;
  entry: number; // the entry in focus on 02 (traced, or the default specimen)
  p01: number; // 01: rendered progress, real time (0) to the month-end ridge (1)
  stream: Float32Array | null; // 01: each entry's position along the stream
  hover: number | null;
  hoverLayer: number; // 03: the layer under the pointer or focus, -1 for none
};

/* 02 · the proof stack: while tracing, the ledger re-forms into five layers,
   one per proof step, with the traced entry threaded through all of them. */
export const TRACE_Y = [0.3, 1.8, 3.3, 4.8, 6.3];
export const TRACE_X = 1.65;
export const TRACE_Z = -0.35;
const L2_SLOT = 300 + 7 * 20 + 14; // the journal-layer cell the thread passes through
export const TRACE_ANCHORS = TRACE_Y.map((y) => [TRACE_X, y + 0.25, TRACE_Z] as [number, number, number]);

function traceLayer(j: number, o: Out, active: number) {
  let k: number;
  let x: number;
  let z: number;
  let sx = 0.55;
  let sy = 1;
  let sz = 0.65;
  let ry = 0;
  if (j < 150) {
    k = 0;
    x = ((j % 15) - 7) * 0.55;
    z = (Math.floor(j / 15) - 4.5) * 0.38;
  } else if (j < 300) {
    k = 1;
    const q = j - 150;
    x = ((q % 15) - 7) * 0.55;
    z = (Math.floor(q / 15) - 4.5) * 0.38;
    sx = 0.36;
    sz = 0.62;
    sy = 1.8;
    ry = 0.785;
  } else if (j < 600) {
    k = 2;
    const q = j - 300;
    x = ((q % 20) - 9.5) * 0.41;
    z = (Math.floor(q / 20) - 7) * 0.25;
    sx = 0.46;
    sz = 0.5;
  } else if (j < 750) {
    k = 3;
    const q = j - 600;
    x = ((q % 15) - 7) * 0.55;
    z = (Math.floor(q / 15) - 4.5) * 0.38;
    const on = (q + Math.floor(q / 15)) % 3 === 0;
    sx = on ? 0.55 : 0.2;
    sz = on ? 0.65 : 0.2;
  } else {
    k = 4;
    const q = j - 750;
    x = ((q % 30) - 14.5) * 0.27;
    z = (Math.floor(q / 30) - 2) * 0.17 + TRACE_Z;
    sx = 0.33;
    sz = 0.4;
    sy = 2.6;
  }
  const on = k === active;
  const near = Math.abs(x - TRACE_X) < 0.3 && Math.abs(z - TRACE_Z) < 0.2;
  return set(o, x, TRACE_Y[k], z, sx, sy, sz, ry, on ? 1.15 : 0.4, on ? (near ? 0.6 : 0.12) : 0);
}

export function layout(i: number, c: Ctx, o: Out) {
  const s = SEED[i];
  const d = day(i);
  const r = row(i);
  switch (c.section) {
    case "s01": {
      // Real time: entries crossing the month at their own speed. As the
      // rendered progress rises they leave the stream one by one, arc up and
      // settle into the month-end ridge; the stream position is kept by the
      // scene, so nothing jumps when a blend begins or reverses.
      const xs = c.stream ? c.stream[i] : ((s[0] * OPEN_SPAN + c.t * openSpeed(i)) % OPEN_SPAN) - OPEN_SPAN / 2;
      const ys = 0.5 + s[2] * 5.6 + Math.sin(c.t * 0.9 + s[3] * 6.28) * 0.12;
      const zs = (s[3] - 0.5) * 13;
      const p = RIDGE[i];
      const f = entryBlend(c.p01, OPEN_STAGGER[i]);
      if (f <= 0) {
        // the stream wraps off screen; entries shrink at the ends so it never pops
        const e = smooth((OPEN_SPAN / 2 - Math.abs(xs)) / 2.2);
        return set(o, xs, ys, zs, 0.62 * e, 0.7 * e, 0.62 * e, (s[1] - 0.5) * 0.3, 0.55 + s[2] * 0.4);
      }
      const e = 1 - (1 - smooth((OPEN_SPAN / 2 - Math.abs(xs)) / 2.2)) * (1 - f);
      const L = (a0: number, a1: number) => a0 + (a1 - a0) * f;
      return set(
        o,
        L(xs, p.x),
        L(ys, p.y) + Math.sin(Math.PI * f) * 1.1,
        L(zs, p.z),
        L(0.62, 1) * e,
        L(0.7, 1) * e,
        L(0.62, 1.1) * e,
        L((s[1] - 0.5) * 0.3, p.ry),
        L(0.55 + s[2] * 0.4, 0.62 + s[2] * 0.3),
        Math.sin(Math.PI * f) * 0.32,
        L(0, p.rz),
      );
    }

    case "s02": {
      const F = c.entry;
      if (c.tracing) {
        // swap the traced entry into the journal layer's thread cell
        const j = i === F ? L2_SLOT : i === L2_SLOT ? F : i;
        traceLayer(j, o, c.tstep);
        if (i === F) {
          o.y += c.tstep === 2 ? 0.45 : 0.15;
          o.sx = 0.6;
          o.sz = 0.7;
          o.tone = c.tstep === 2 ? 1.3 : 0.9;
          o.glow = c.tstep === 2 ? 0.75 : 0.25;
        }
        return;
      }
      // Connect (0) · Reason (1) · Prove (2): the same 900 entries, three states.
      const k = s02Tier(r);
      if (c.step <= 0) {
        // Connect: flat, quiet and low. Only the entries an event is landing
        // in respond; everything else waits.
        set(o, gx(d) * 0.62, 0.045, gz(r) * 0.78, 0.64, 1, 0.82, 0, 0.58);
        const f = CONNECT_FEEDS.findIndex((e) => e.entry === i);
        if (f >= 0) {
          const land = smooth((connectPhase(f, c.t) - 0.82) / 0.18);
          o.y += land * 0.22;
          o.tone = 0.8 + land * 0.4;
          o.glow = land * 0.5;
        }
      } else {
        // Reason and Prove: the rows rise into four tiers that step up and
        // back (source, accounting logic, journal entry, review). Reason
        // builds the first three; the review tier is still forming.
        const T = S02_TIERS[k];
        const forming = c.step === 1 && k === 3;
        const y = forming ? T.y * 0.72 : T.y;
        const z = T.z + (r - T.mid) * 0.4;
        let tone = forming ? 0.38 : [0.66, 0.8, 0.92, 0.88][k];
        let glow = 0;
        let yy = y;
        if (c.step >= 2) {
          // Prove: every tier works. A slow wave runs along each, offset by tier.
          const w = Math.sin(c.t * 1.3 - d * 0.32 + k * 1.1);
          yy += w * 0.05;
          glow = Math.max(0, w) * (k === 3 ? 0.16 : 0.07);
          tone += 0.06;
        } else if (k === 1) {
          // Reason: a classification sweep runs along the logic tier, entry
          // by entry, as accounting logic takes each event in turn
          const sweep = ((c.t * 4) % 38) - 4;
          const near = Math.max(0, 1 - Math.abs(d - sweep) / 2.5);
          yy += near * 0.12;
          glow = near * 0.3;
          tone += near * 0.2;
        }
        const ch = S02_CHAIN_DAYS.indexOf(d);
        if (ch >= 0 && r === T.chainRow && (c.step >= 2 || k < 3)) {
          // the entries the chains run through
          tone = 1.12;
          glow = c.step >= 2 ? 0.25 + 0.3 * Math.max(0, Math.sin(c.t * 2.1 - k * 1.2 + ch)) : 0.14 + 0.16 * Math.max(0, Math.sin(c.t * 1.4 - k + ch));
        }
        set(o, gx(d) * 0.62, yy, z, 0.64, 1, 0.82, 0, tone, glow);
      }
      if (i === F) {
        // the entry in focus: landed on Connect, lifted on Reason, proven on Prove
        o.y += c.step <= 0 ? 0.35 : c.step === 1 ? 0.8 : 1.0;
        o.sx = o.sz = 1.2;
        o.ry = 0.35;
        o.tone = 1.25;
        o.glow = c.step >= 2 ? 0.6 : 0.4;
      } else if (c.hover === i) {
        o.y += 0.4;
        o.tone = 1.2;
        o.glow = 0.3;
      }
      return;
    }

    case "s03": {
      // The ledger the stack stands on: half the spacing, so the stack reads.
      const sel = c.step - 1; // -1 overview, 0..4 a layer (see interaction.ts)
      if (i < STACK_BASE) return set(o, gx(d) * 0.52, 0.045, gz(r) * 0.62, 0.5, 1, 0.62, 0, sel >= 0 ? 0.5 : 0.72);
      const k = layerOfEntry(i);
      const q = i - STACK_BASE - k * STACK_PER; // 0..89 within the layer
      const col = q % 15;
      const rw = Math.floor(q / 15);
      let lx = (col - 7) * 0.52;
      let lz = (rw - 2.5) * 0.5;
      let ly = 0;
      let sx = 0.58;
      let sy = 1;
      let sz = 1.05;
      let ry = 0;
      let tone = 0.82;
      if (k === 0) {
        // source events: loose, as they arrive
        lx += (s[0] - 0.5) * 0.2;
        lz += (s[1] - 0.5) * 0.16;
        ry = (s[2] - 0.5) * 0.5;
        sx = 0.55;
        sz = 0.9;
        tone = 0.6 + s[3] * 0.2;
      } else if (k === 1) {
        // accounting logic: the rule as a field of pegs
        ry = 0.785;
        sx = 0.32;
        sz = 0.58;
        sy = 2.2;
        tone = 0.74;
      } else if (k === 3) {
        // human review: a sparse checkpoint, most cells waiting on a signature
        const on = (col + rw) % 3 === 0;
        sx = on ? 0.58 : 0.2;
        sz = on ? 1.05 : 0.3;
        tone = on ? 0.86 : 0.45;
      } else if (k === 4) {
        // reporting result: every cell rolls up into one solid line
        lz = 0;
        ly = rw * 0.1;
        sx = 0.6;
        sz = 2.2;
        tone = 0.95;
      }
      const thread = q === STACK_THREAD_Q;
      const edge = col === 0 || col === 14 || (k !== 4 && (rw === 0 || rw === 5));
      let y = STACK_Y0 + k * STACK_GAP + ly;
      let z = STACK_Z;
      let glow = edge ? 0.05 : 0;
      if (thread) {
        tone = 1.15;
        glow = 0.22;
      }
      if (sel >= 0) {
        if (k === sel) {
          // the selected layer comes forward, lit, with its edge and the entry glowing
          z += 0.9;
          tone = Math.min(1.25, tone * 1.35);
          glow = thread ? 0.8 : edge ? 0.3 : 0.04;
        } else {
          y += k > sel ? 0.75 : -0.35;
          tone *= 0.38;
          glow = thread ? 0.12 : 0;
        }
      } else if (c.hoverLayer === k) {
        tone = Math.min(1.25, tone * 1.22);
        glow = thread ? 0.5 : edge ? 0.22 : 0.02;
      }
      if (sel >= 0 && c.hoverLayer === k && k !== sel) {
        tone *= 1.9;
        glow = edge ? 0.16 : glow;
      }
      const a = STACK_RY[k];
      const cs = Math.cos(a);
      const sn = Math.sin(a);
      return set(o, STACK_X + STACK_DX[k] + lx * cs + lz * sn, y, z - lx * sn + lz * cs, sx, sy, sz, a + ry, tone, glow);
    }

    case "s05": {
      flat(o, i, 0.7);
      if (c.step === 1 && d >= 23) {
        // Controller: the last week of the month, lifted back out
        o.y = 0.5 + (d - 23) * 0.06;
        o.tone = 1.15;
        o.glow = 0.2;
      }
      if (c.step === 2) {
        // CFO: three times the volume, still one neat block
        const tier = Math.floor(r / 10);
        o.x = gx(d) * 0.62;
        o.z = gz((r % 10) * 3 + 1) * 0.62;
        o.y = 0.05 + tier * 0.55;
        o.sx = 0.62;
        o.sz = 0.62;
        o.tone = 0.75 + tier * 0.12;
      }
      if (c.step === 3 && i % 37 === 0) {
        // CAO: traced entries lift toward their evidence
        o.y = 1.6 + s[0] * 1.2;
        o.tone = 1.15;
        o.glow = 0.35;
      }
      return;
    }

    case "s06": {
      const g = Math.floor(i / 225);
      const j = i % 225;
      const cx = [-10.5, -3.5, 3.5, 10.5][g];
      const live = c.step >= g + 1;
      const now = c.step === g + 1;
      let x = cx;
      let y = 0.05;
      let z = 0;
      let sx = 1;
      let sy = 1;
      let sz = 1;
      let ry = 0;
      if (g === 0) {
        // Harvest: loose evidence is collected into ordered piles
        const p = Math.floor(j / 9);
        const l = j % 9;
        if (!live) return set(o, cx + (s[0] - 0.5) * 6, 0.3 + s[1] * 2.2 + Math.sin(c.t * 0.8 + s[2] * 6.28) * 0.15, (s[2] - 0.5) * 4, 0.6, 1, 0.9, s[3] * 6.28, 0.3);
        x = cx + ((p % 5) - 2) * 0.95;
        z = (Math.floor(p / 5) - 2) * 0.72;
        y = 0.05 + l * 0.095;
        sx = 0.8;
        sz = 1.2;
        ry = (s[1] - 0.5) * 0.12;
      } else if (g === 1) {
        // Prove: a second ledger assembles in registration with the first
        const side = j < 112 ? 0 : 1;
        const k = j % 112;
        x = cx + (side ? 1.55 : -1.55) + ((k % 7) - 3) * 0.37;
        z = (Math.floor(k / 7) - 7.5) * 0.24;
        sx = 0.4;
        sz = 0.45;
        if (j === 224) {
          x = cx;
          y = 0.5;
          z = 0;
          sx = 0.3;
          sy = 2;
          sz = 0.3;
        }
        if (!live && (side === 1 || j === 224)) return set(o, cx + 1.55 + (s[0] - 0.5) * 3, 0.03, (s[1] - 0.5) * 4, 0.4, 0.4, 0.45, s[2] * 3, 0.18);
      } else if (g === 2) {
        // Launch: a tower the market can see
        const l = Math.floor(j / 16);
        const k = j % 16;
        x = cx + ((k % 4) - 1.5) * 0.5;
        z = (Math.floor(k / 4) - 1.5) * 0.5;
        y = 0.08 + l * 0.15;
        sx = 0.58;
        sy = 1.7;
        sz = 1.05;
      } else {
        // Scale: the same workflow repeats outward, ring by ring
        const ring = j < 45 ? 0 : j < 120 ? 1 : 2;
        const k = ring === 0 ? j : ring === 1 ? j - 45 : j - 120;
        const n = [45, 75, 105][ring];
        const R = [1.2, 2.2, 3.2][ring];
        const a = (k / n) * Math.PI * 2 + ring * 0.2;
        x = cx + Math.cos(a) * R;
        z = Math.sin(a) * R * 0.8;
        ry = -a;
        sx = 0.32;
        sz = 0.5;
        y = 0.05 + (live ? Math.max(0, Math.sin(c.t * 1.4 - ring * 0.9)) * 0.22 : 0);
        if (!live && ring > 0) return set(o, cx + Math.cos(a) * 0.6, 0.03, Math.sin(a) * 0.5, 0.2, 0.4, 0.3, ry, 0.15);
      }
      if (!live) return set(o, x, 0.03, z, sx, 0.4, sz, ry, 0.2);
      return set(o, x, y, z, sx, sy, sz, ry, now ? 1.05 : 0.62, now ? 0.12 : 0);
    }

    case "s07": {
      // Foundational (build 1) and before are the approved gray state and
      // stay exactly as they were. Advancing (2) and Mature (3) grow from it.
      const cx = 3.5;
      const grown = c.step >= 2;
      if (i < 600) {
        const dd = i % 30;
        const l = Math.floor(i / 30);
        if (c.step >= 3 && dd >= 20 && l >= 14) {
          // Mature: the top of the late month lifts into the operating core
          const j = (dd - 20) * 6 + (l - 14);
          const lvl = Math.floor(j / 20);
          const ang = ((j % 20) / 20) * Math.PI * 2 + c.t * 0.15 + lvl * 0.16;
          return set(o, cx + Math.cos(ang) * 2.1, 0.12 + lvl * 0.42, Math.sin(ang) * 2.1, 0.3, 3.2, 0.7, -ang, 1.05, 0.14);
        }
        const a = -Math.PI / 2 + (dd / 30) * Math.PI * 2;
        const R = 6.4;
        const closeWeek = dd < 7;
        const window = dd >= 9 && dd <= 19;
        const y = 0.05 + l * (closeWeek ? 0.012 : 0.1);
        let tone = closeWeek ? 0.16 : window ? 1.0 : 0.55;
        let glow = window && c.step >= 1 ? 0.08 : 0;
        if (grown && window) {
          // launches land: a light runs through the launch window, top first
          const head = 8 + ((c.t * 2.2) % 13);
          const near = Math.max(0, 1 - Math.abs(dd - head) / 1.6);
          glow += near * (l / 19) * 0.35;
          tone += near * 0.15;
        }
        return set(o, cx + Math.cos(a) * R, y, Math.sin(a) * R, 0.75, 1, 0.9, -a, tone, glow);
      }
      const b = Math.floor((i - 600) / 20);
      const l = (i - 600) % 20;
      const P = PLAYS[b];
      const a = -Math.PI / 2 + ((b + 0.5) / 15) * Math.PI * 2;
      const R = 10.2;
      const x = cx + Math.cos(a) * R;
      const z = Math.sin(a) * R;
      const lit = c.step >= 1 && !P.open && P.phase <= c.step;
      if (!grown) return set(o, x, lit ? 0.06 + l * 0.17 : 0.04 + l * 0.014, z, 0.55, lit ? 2 : 1, 0.55, -a, lit ? 1.05 : 0.2, lit ? 0.18 : 0);
      // the open slot: a muted, unfilled footprint, never a lit play
      if (P.open) return set(o, x, 0.03 + l * 0.008, z, 0.42, 0.6, 0.42, -a, 0.1, 0);
      if (!lit) return set(o, x, 0.04 + l * 0.014, z, 0.55, 1, 0.55, -a, 0.2, 0);
      // workflow: a light climbs each live column, one column after another
      const sel = Math.floor(b / 3) === c.jstage;
      const climb = ((c.t * 5 + b * 2.3) % 26) - 3;
      const g = Math.max(0, 1 - Math.abs(l - climb) / 2.2);
      return set(o, x, 0.06 + l * 0.17, z, 0.55, 2, 0.55, -a, (sel ? 1.22 : 1.02) + g * 0.15, (sel ? 0.24 : 0.12) + g * 0.3);
    }

    case "s08": {
      if (c.step === 0) {
        const x = (s[0] - 0.5) * 42;
        const y = 1.5 + s[1] * 13 + Math.sin(c.t * 0.5 + s[2] * 6.28) * 0.4;
        const z = (s[2] - 0.5) * 26 - 3;
        return set(o, x, y, z, 0.3, 0.4, 0.3, c.t * 0.2 + s[3] * 6.28, 0.3 + s[3] * 0.25);
      }
      if (c.step === 2) return stateUse08(i, c.t, o);
      if (c.step === 3) return stateValue08(i, c.t, o);
      if (c.step === 4) return stateTrust08(i, c.t, o);
      // overview (1) and Commercial (5): four columns, the selected one raised
      const col = Math.floor(i / 225);
      const j = i % 225;
      const l = Math.floor(j / 25);
      const k = j % 25;
      const cx = M8 + [-6.6, -2.2, 2.2, 6.6][col];
      const on = c.step - 2 === col;
      return set(o, cx + ((k % 5) - 2) * 0.56, 0.06 + l * 0.12 + (on ? 0.6 : 0), (Math.floor(k / 5) - 2) * 0.56, 0.62, 1.4, 1.15, 0, c.step < 2 ? 0.85 : on ? 1.15 : 0.42, on ? 0.18 : 0);
    }

    default:
      return flat(o, i, 0.5);
  }
}

/* ------------------------------------------------- 08 · three states
   Each answers its question in the shape of the ledger itself.
   Use: work keeps entering the ledger and passing through it.
   Value: a month of reconstruction compressed into one current block.
   Trust: the block opened up, result to source, with the review gate. */

export const M8 = 3; // centre of the 08 object, local
// Use: four loops of work through one ledger slab
export const USE_LANES = [-1.95, -0.65, 0.65, 1.95];
const LOOP_X0 = M8 - 5.4;
const LOOP_X1 = M8 + 5.4;
const LOOP_R = 1.55;
const LOOP_Y = 0.17;
const LOOP_LEN = 2 * (LOOP_X1 - LOOP_X0) + 2 * Math.PI * LOOP_R;
export const loopSpeed = (lane: number) => 0.075 * (1 + lane * 0.13);
const TRAIN = 0.22; // each train is this share of its loop
// a point on the loop at distance u (0..1 of the loop): x, y and heading
export function loopAt(u: number, out: { x: number; y: number; a: number }) {
  const S = (u - Math.floor(u)) * LOOP_LEN;
  const run = LOOP_X1 - LOOP_X0;
  const arc = Math.PI * LOOP_R;
  if (S < run) {
    out.x = LOOP_X0 + S;
    out.y = LOOP_Y;
    out.a = 0;
  } else if (S < run + arc) {
    const th = -Math.PI / 2 + ((S - run) / arc) * Math.PI;
    out.x = LOOP_X1 + Math.cos(th) * LOOP_R;
    out.y = LOOP_Y + LOOP_R + Math.sin(th) * LOOP_R;
    out.a = th + Math.PI / 2;
  } else if (S < 2 * run + arc) {
    out.x = LOOP_X1 - (S - run - arc);
    out.y = LOOP_Y + 2 * LOOP_R;
    out.a = Math.PI;
  } else {
    const th = Math.PI / 2 + ((S - 2 * run - arc) / arc) * Math.PI;
    out.x = LOOP_X0 + Math.cos(th) * LOOP_R;
    out.y = LOOP_Y + LOOP_R + Math.sin(th) * LOOP_R;
    out.a = th + Math.PI / 2;
  }
  return out;
}
const lp = { x: 0, y: 0, a: 0 };

function stateUse08(i: number, t: number, o: Out) {
  if (i < 540) {
    // the ledger slab; cells under a passing loop light as the work goes through
    const col = i % 30;
    const rw = Math.floor(i / 30);
    const x = M8 + (col - 14.5) * 0.36;
    const z = (rw - 8.5) * 0.34;
    let glow = 0;
    const Sc = x - LOOP_X0; // this cell's distance along the bottom run
    for (let l = 0; l < 4; l++) {
      if (Math.abs(z - USE_LANES[l]) > 0.2) continue;
      for (let n = 0; n < 3; n++) {
        const front = ((n / 3 + t * loopSpeed(l) + l * 0.11 + TRAIN) % 1) * LOOP_LEN;
        let back = front - Sc;
        if (back < 0) back += LOOP_LEN;
        if (back < TRAIN * LOOP_LEN) glow = Math.max(glow, 0.12 + 0.33 * (1 - back / (TRAIN * LOOP_LEN)));
      }
    }
    return set(o, x, 0.05, z, 0.4, 1, 0.7, 0, 0.78 + glow * 0.6, glow);
  }
  const j = i - 540;
  const l = Math.floor(j / 90);
  const k = j % 90;
  // three trains of thirty per loop, so the work arrives in batches
  const u = ((k % 30) / 30) * TRAIN + Math.floor(k / 30) / 3 + t * loopSpeed(l) + l * 0.11;
  loopAt(u, lp);
  const inside = lp.y < LOOP_Y + 0.01 && lp.x > M8 - 5.3 && lp.x < M8 + 5.3;
  return set(o, lp.x, lp.y + 0.06, USE_LANES[l], 0.34, 1.2, 0.8, 0, inside ? 1.15 : 0.72, inside ? 0.45 : 0.06, lp.a);
}

function stateValue08(i: number, t: number, o: Out) {
  // nine levels of ten by ten: the whole month, current and compact
  const lvl = Math.floor(i / 100);
  const k = i % 100;
  const x = M8 + ((k % 10) - 4.5) * 0.36;
  const z = (Math.floor(k / 10) - 4.5) * 0.36;
  const scan = ((t * 0.9) % 12) - 1.5; // a slow light passes up through the block
  const glow = Math.max(0, 1 - Math.abs(lvl - scan)) * 0.3;
  return set(o, x, 0.06 + lvl * 0.25, z, 0.42, 2.6, 0.78, 0, 0.92 + lvl * 0.025 + glow * 0.5, glow);
}

// Trust geometry, shared with the scene's filaments
export const TRUST = { srcY: 0.05, entY: 2.4, gateY: 4.2, gateR: 1.5, resY: 6.0 };
export const trustLinks = [3, 17, 46, 88, 121, 160, 204, 251]; // source cells the threads open onto

function stateTrust08(i: number, t: number, o: Out) {
  if (i < 300) {
    const col = i % 20;
    const rw = Math.floor(i / 20);
    const linked = trustLinks.includes(i);
    return set(o, M8 + (col - 9.5) * 0.52, TRUST.srcY, (rw - 7) * 0.4, 0.52, 1, 0.75, 0, linked ? 1.15 : 0.5, linked ? 0.35 : 0);
  }
  if (i < 600) {
    const j = i - 300;
    const col = j % 20;
    const rw = Math.floor(j / 20);
    const linked = trustLinks.includes(j);
    return set(o, M8 + (col - 9.5) * 0.42, TRUST.entY, (rw - 7) * 0.3, 0.42, 1, 0.55, 0, linked ? 1.1 : 0.66, linked ? 0.25 : 0);
  }
  if (i < 660) {
    // the review gate: everything that reaches the result passes through it
    const a = ((i - 600) / 60) * Math.PI * 2 + t * 0.12;
    return set(o, M8 + Math.cos(a) * TRUST.gateR, TRUST.gateY, Math.sin(a) * TRUST.gateR, 0.25, 4, 0.5, -a, 1.05, 0.14);
  }
  const j = i - 660;
  const col = j % 40;
  const rw = Math.floor(j / 40);
  return set(o, M8 + (col - 19.5) * 0.2, TRUST.resY + rw * 0.12, 0, 0.22, 1.4, 2.2, 0, 1.15, 0.12);
}

/* --------------------------------------------------------- framing
   Each slide places the whole world (scale and offset) so the object sits
   in the open part of the layout, clear of the type. */

export type Place = { s: number; x: number; z: number };

// Dev-only live tuning: window.__rillet.place.s02 = {...}, .pose["s02:3"] = {...}
export const TUNE: { place: Record<string, Place>; pose: Record<string, Pose> } = { place: {}, pose: {} };

export function place(section: string, tracing = false): Place {
  const key = tracing ? `${section}:trace` : section;
  if (TUNE.place[key]) return TUNE.place[key];
  // left of the (wider) explainer, so no layer runs under it
  if (section === "s02" && tracing) return { s: 0.6, x: -1.1, z: -1 };
  switch (section) {
    case "s02":
      // the open band above the explainer and right of the title: the
      // ledger lies there on Connect and rises into it on Reason and Prove
      return { s: 0.5, x: 10.6, z: -5 };
    case "s03":
      return { s: 0.72, x: 6.6, z: 0 };
    case "s05":
      return { s: 0.46, x: 8.4, z: -0.5 };
    case "s06":
      return { s: 0.62, x: 0, z: 0 };
    case "s07":
      return { s: 0.42, x: 8.4, z: -1 };
    case "s08":
      return { s: 0.6, x: 6.2, z: 0 };
    default:
      return { s: 1, x: 0, z: 0 };
  }
}

/* -------------------------------------------------------------- camera
   Poses are in world space, after placement. */

export type Pose = { p: [number, number, number]; l: [number, number, number] };

export function pose(section: string, step: number, tracing = false): Pose {
  const t = (tracing && TUNE.pose[`${section}:trace`]) || TUNE.pose[`${section}:${step}`] || TUNE.pose[section];
  if (t) return t;
  if (section === "s02" && tracing) return { p: [-4.6, 6.8, 16.5], l: [0.6, 2.5, -1] };
  switch (section) {
    case "s01":
      return step === 0 ? { p: [-6, 3.6, 22], l: [1.5, 2.6, 0] } : { p: [-6, 5.5, 18], l: [6, 1.8, 0] };
    case "s02":
      // Connect: low and close to the flat ledger · Reason: up and back to
      // see the tiers rise · Prove: higher still, the whole network in view
      return (
        [
          { p: [5, 7, 22], l: [6.7, -2.3, -4.5] },
          { p: [5, 8, 23], l: [6.7, -1.9, -4.5] },
          { p: [5, 8.6, 23.5], l: [6.7, -1.4, -4.5] },
        ] as Pose[]
      )[Math.max(0, Math.min(2, step))];
    case "s03": {
      // overview, then one framing per layer (world space, after placement)
      if (step < 1) return { p: [-1, 6.5, 19], l: [4.2, 2.6, 0] };
      const y = (STACK_Y0 + (step - 1) * STACK_GAP) * 0.72;
      return { p: [0.8, y + 3.4, 16], l: [4.7, y + 0.2, 0.6] };
    }
    case "s05":
      return [
        { p: [0, 12, 21], l: [4.4, 0.5, -1] },
        { p: [6, 6.5, 14], l: [9.6, 0.8, -1] },
        { p: [2, 10, 16], l: [5.2, 1, -0.5] },
        { p: [1, 8, 17], l: [5, 1.1, -1] },
        { p: [1, 10, 22], l: [5, 1.6, -3] },
        { p: [0, 12, 21], l: [4.4, 0.5, -1] },
      ][Math.min(step, 5)] as Pose;
    case "s06":
      return { p: [0, 6.2, 21], l: [0, 3.3, 0] };
    case "s07":
      // Foundational keeps its approved view; Advancing and Mature come lower
      // to show the columns, the links and the work moving between them
      if (step >= 3) return { p: [3, 12.2, 18], l: [6.8, 1.1, 0.6] };
      if (step === 2) return { p: [3.4, 11.4, 17.6], l: [6.8, 0.9, 0.6] };
      return { p: [4, 15, 15.5], l: [6.4, 0, 0.9] };
    case "s08":
      return (
        [
          { p: [-4, 6, 24], l: [3, 6, -2] }, // impressions
          { p: [2, 6.5, 16], l: [5, 0.6, 0] }, // the four measures
          { p: [-0.6, 3.6, 17.5], l: [4.6, 0.3, 0] }, // Use: low, along the loops
          { p: [3.4, 10.5, 12.5], l: [6.3, 0.2, 0] }, // Value: close, looking down on the block
          { p: [1.6, 7.2, 18.5], l: [6.6, 0.7, 0] }, // Trust: the opened structure, top to bottom
          { p: [2, 6.5, 16], l: [5, 0.6, 0] }, // Commercial
        ] as Pose[]
      )[Math.min(step, 5)];
    default:
      return { p: [0, 12, 24], l: [0, 0, 0] };
  }
}
