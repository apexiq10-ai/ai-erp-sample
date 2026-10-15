"use client";

import { Canvas, advance, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { s01, s02, s07, s08 } from "@/content";
import type { ProofState } from "@/components/proof/model";
import { useDeck } from "@/components/ui";
import {
  COLS,
  CONNECT_FEEDS,
  M8,
  N,
  OPEN_SPAN,
  OPEN_STAGGER,
  PC_PLAY,
  PLAYS,
  S02_CHAIN_DAYS,
  S02_RESULT,
  SPECIMEN,
  TILE,
  TOWERS,
  TRACE_ANCHORS,
  TRUST,
  TUNE,
  connectPhase,
  dayAt,
  gx,
  gz,
  layout,
  openSpeed,
  openStreamStart,
  place,
  playAt,
  pose,
  rand,
  s02Chain,
  stackAnchor,
  stackThread,
  towerOf,
  trustLinks,
  type Ctx,
  type Out,
  type Pose,
} from "./formations";
import { STACK_LAYERS, damp, dragToProgress, entryBlend, layerOfEntry, openStepFor, pointerToProgress, smooth, stepOfLayer } from "./interaction";
import { hotspotEls, journeyStage, markerEls, openEls, openTarget, openTouched, stackHover, useJourney, useWorld, worldStore } from "./store";

/* The persistent 3D world behind slides 01 to 08 (except 04, which is
   Runway footage). Graphite and brushed-silver entries in a black studio,
   cool-white filaments, and violet only where evidence or approval lives,
   so the code-built scenes and the Runway films read as one world.

   One render loop (react-three-fiber's) drives everything: entries ease
   toward each slide's formation from wherever they are (position and scale
   by exponential approach, rotation by quaternion slerp), so any change of
   slide, build or selection starts from the rendered state and can be
   interrupted at any moment. Nothing else animates the scene. */

const INK = "#080809";
const VIOLET = new THREE.Color("#8a7bff");
const SILVER = new THREE.Color(0.6, 0.595, 0.615);
const RIM = new THREE.Color("#cdd3ff");

type Label = { key: string; text: string; at: [number, number, number]; side?: boolean; tone?: "dim" | "muted" };

function labelsFor(section: string, step: number, tracing: boolean, jstage: number): Label[] {
  switch (section) {
    case "s01":
      return [
        { key: "d1", text: `${s01.day} 1`, at: [gx(0), 0, 7.4] },
        { key: "d30", text: `${s01.day} 30`, at: [gx(29), 0, 7.4] },
      ];
    case "s02":
      return tracing ? [] : s02.sources.map((t, k) => ({ key: t, text: t, at: [TOWERS[k].x, 5.6, TOWERS[k].z] }));
    case "s07": {
      // the selected journey stage names its three plays in the scene, with
      // the same labels as the module below (an open slot reads as one)
      const plays = PLAYS.slice(jstage * 3, jstage * 3 + 3).map((p, k): Label => {
        const lit = !p.open && p.phase <= Math.max(1, step);
        // beside the column at mid-height, so labels stay inside the ring's
        // area; state reads in the label too (open slot muted, later dim)
        const at = playAt(jstage * 3 + k, lit ? 1.6 : 0.3);
        return { key: `p${jstage}-${k}`, text: p.name, at, side: true, tone: p.open ? "muted" : lit ? undefined : "dim" };
      });
      return [{ key: "cw", text: s07.closeWeek, at: [3.5 + Math.cos(-Math.PI / 2 + 0.7) * 6.4, 0.6, Math.sin(-Math.PI / 2 + 0.7) * 6.4] }, ...plays];
    }
    case "s08":
      return step === 0 ? [{ key: "imp", text: s08.impressions, at: [3, 9.5, -3] }] : [];
    default:
      return [];
  }
}

/* Light per state: key intensity, rim intensity, rim colour, environment.
   Every slide the brief protects keeps the studio default. */
type Light = { key: number; rim: number; rimColor: THREE.Color; env: number };
const STUDIO: Light = { key: 2.3, rim: 1.3, rimColor: RIM, env: 0.42 };
function lightFor(section: string, step: number): Light {
  if (section === "s08") {
    if (step === 2) return { key: 2.0, rim: 2.0, rimColor: RIM, env: 0.38 }; // Use: rim light catches the moving work
    if (step === 3) return { key: 3.1, rim: 0.9, rimColor: RIM, env: 0.6 }; // Value: one bright, solid block
    if (step === 4) return { key: 1.7, rim: 2.1, rimColor: VIOLET, env: 0.36 }; // Trust: violet backlight through the open structure
  }
  if (section === "s03" && step >= 1) return { key: 2.1, rim: 1.7, rimColor: RIM, env: 0.42 };
  // 02: Connect is subdued; Reason brings up the rim to model the tiers;
  // Prove is the brightest and most contrasted
  if (section === "s02") return [{ key: 1.7, rim: 0.8, rimColor: RIM, env: 0.3 }, { key: 2.3, rim: 1.7, rimColor: RIM, env: 0.42 }, { key: 2.5, rim: 2.3, rimColor: RIM, env: 0.5 }][Math.max(0, Math.min(2, step))];
  // 07: Advancing and Mature light up; Foundational keeps the studio
  if (section === "s07" && step >= 2) return step >= 3 ? { key: 2.6, rim: 2.1, rimColor: RIM, env: 0.48 } : { key: 2.5, rim: 1.9, rimColor: RIM, env: 0.45 };
  return STUDIO;
}

const glowTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.18, "rgba(255,255,255,0.85)");
  r.addColorStop(0.45, "rgba(255,255,255,0.18)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

type SceneProps = {
  section: string;
  step: number;
  motion: boolean;
  hidden: boolean;
  turnable: boolean;
  labels: Label[];
  labelEls: MutableRefObject<(HTMLDivElement | null)[]>;
  proof: ProofState;
  onStep: (id: string, step: number) => void;
};

// Per-entry render state: position, scale, rotation (quaternion), tone, glow.
const STRIDE = 12;

function Scene({ section, step, motion, hidden, turnable, labels, labelEls, proof, onStep }: SceneProps) {
  const { gl, scene, camera, size } = useThree();
  const group = useRef<THREE.Group>(null);
  const ledger = useRef<THREE.InstancedMesh>(null);
  const towers = useRef<THREE.InstancedMesh>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const pulses = useRef<THREE.Points>(null);
  const violets = useRef<THREE.Points>(null);
  const result = useRef<THREE.Mesh>(null);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const rimLight = useRef<THREE.DirectionalLight>(null);

  /* ---- studio: environment reflections, fog, black void */
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = STUDIO.env;
    scene.background = new THREE.Color(INK);
    scene.fog = new THREE.Fog(INK, 26, 62);
    return () => {
      scene.environment = null;
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene]);

  /* ---- geometry + materials, built once and shared by every slide */
  const entryGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(TILE[0], TILE[1], TILE[2]);
    g.setAttribute("aGlow", new THREE.InstancedBufferAttribute(new Float32Array(N), 1));
    return g;
  }, []);
  const metal = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.78, roughness: 0.34 });
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nattribute float aGlow;\nvarying float vGlow;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvGlow = aGlow;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying float vGlow;")
        .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.93, 0.93, 1.0) * vGlow;");
    };
    return m;
  }, []);
  const towerGeo = useMemo(() => new THREE.BoxGeometry(1.5, 5.2, 0.5), []);
  const towerMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x7a797e, metalness: 0.85, roughness: 0.28 }), []);
  const tex = useMemo(() => glowTexture(), []);
  // The scene owns these; release them from the GPU when it goes away.
  useEffect(
    () => () => {
      entryGeo.dispose();
      metal.dispose();
      towerGeo.dispose();
      towerMat.dispose();
      tex.dispose();
    },
    [entryGeo, metal, towerGeo, towerMat, tex],
  );

  const MAXSEG = 200;
  const segPos = useMemo(() => new Float32Array(MAXSEG * 6), []);
  const pulsePos = useMemo(() => new Float32Array(120 * 3), []);
  const violetPos = useMemo(() => new Float32Array(24 * 3), []);

  /* ---- per-entry state, eased toward each formation */
  const S = useMemo(() => {
    const cur = new Float32Array(N * STRIDE);
    const stream = Float32Array.from({ length: N }, (_, i) => openStreamStart(i));
    const o: Out = { x: 0, y: 0, z: 0, sx: 1, sy: 1, sz: 1, ry: 0, rz: 0, tone: 0.8, glow: 0 };
    const ctx: Ctx = { section: "s01", step: 0, t: 0, hover: null, hoverLayer: -1, jstage: 0, tracing: false, tstep: 0, entry: SPECIMEN, p01: 0, stream };
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    for (let i = 0; i < N; i++) {
      layout(i, ctx, o);
      q.setFromEuler(e.set(0, o.ry, o.rz));
      cur.set([o.x, o.y, o.z, o.sx, o.sy, o.sz, q.x, q.y, q.z, q.w, o.tone, o.glow], i * STRIDE);
    }
    const rate = Float32Array.from({ length: N }, (_, i) => 0.028 + rand(i + 333) * 0.06);
    return { cur, rate, o, ctx, stream };
  }, []);

  const clock = useRef(0);
  const age = useRef(0);
  const hover = useRef<number | null>(null);
  const open = useRef(openTarget.get()); // 01: rendered progress
  const camPos = useRef(new THREE.Vector3(-6, 3.6, 22));
  const camQ = useRef(new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(new THREE.Vector3(-6, 3.6, 22), new THREE.Vector3(1.5, 2.6, 0), new THREE.Vector3(0, 1, 0))));
  const mouse = useRef({ x: 0, y: 0 });
  const yaw = useRef({ v: 0, target: 0 });
  const towerOn = useRef(0);
  const resultOn = useRef(0);
  const frame = useRef(0);
  const occluded = useRef<boolean[]>(Array(STACK_LAYERS).fill(false));
  const T = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      look: new THREE.Matrix4(),
      pos: new THREE.Vector3(),
      scl: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      tq: new THREE.Quaternion(),
      col: new THREE.Color(),
      v3: new THREE.Vector3(),
      l3: new THREE.Vector3(),
      ray: new THREE.Raycaster(),
      hits: [] as THREE.Intersection[],
    }),
    [],
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") (window as unknown as { __scene: unknown }).__scene = { camera, scene, ledger, S };
  }, [camera, scene, S]);

  // The scene's age restarts per slide, not per build, so builds driven by
  // the pointer on 01 never slow the response down.
  useEffect(() => {
    age.current = 0;
  }, [section]);
  useEffect(() => {
    yaw.current.target = 0;
  }, [section, step]);

  /* ---- pointer: camera parallax everywhere, drag to turn on 02 */
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = e.clientX / window.innerWidth - 0.5;
      mouse.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  useEffect(() => {
    if (!turnable) return;
    const el = gl.domElement;
    let x0: number | null = null;
    const down = (e: PointerEvent) => {
      x0 = e.clientX;
    };
    const move = (e: PointerEvent) => {
      if (x0 === null) return;
      yaw.current.target = Math.max(-1.1, Math.min(1.1, yaw.current.target + (e.clientX - x0) * 0.005));
      x0 = e.clientX;
    };
    const up = () => (x0 = null);
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [gl, turnable]);

  /* ---- 01: the pointer closes the month
     A mouse or pen maps its horizontal position; a touch drags relatively
     (vertical drags still scroll: the canvas is touch-action: pan-y, and
     the browser cancels the pointer when it takes the pan). Controls,
     the header, the dock and overlays are ignored, so ordinary clicking
     never moves the month. */
  const stepRef = useRef(step);
  stepRef.current = step;
  useEffect(() => {
    if (section !== "s01" || hidden) return;
    let touchX: number | null = null;
    let p0 = 0;
    const ignore = (e: PointerEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      return !!t?.closest("button, a, input, header, footer, .index, .detail");
    };
    const commit = (p: number) => {
      openTarget.set(p);
      if (!openTouched.get() && p > 0.04) openTouched.set(true);
      const s = openStepFor(p, stepRef.current);
      if (s !== stepRef.current) onStep("s01", s);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        if (touchX !== null) commit(dragToProgress(p0, e.clientX - touchX, window.innerWidth));
        return;
      }
      if (!ignore(e)) commit(pointerToProgress(e.clientX, window.innerWidth));
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || ignore(e)) return;
      touchX = e.clientX;
      p0 = openTarget.get();
    };
    const up = () => void (touchX = null);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [section, hidden, onStep]);
  // A build set by the deck (keys, the dock, a jump) moves the target to
  // that endpoint, unless the target already implies that build.
  useEffect(() => {
    if (section !== "s01") return;
    if (openStepFor(openTarget.get(), step) !== step) openTarget.set(step);
  }, [section, step]);

  const tracing = section === "s02" && proof.tracing;
  const interactive = section === "s02" && !tracing;
  const stack = section === "s03";

  useFrame((_, dtRaw) => {
    if (hidden) return;
    const t0 = performance.now();
    const dt = Math.max(0, Math.min(dtRaw, 0.05));
    if (motion) clock.current += dt;
    age.current += dt;
    frame.current++;
    const t = clock.current;
    const snap = !motion;
    const { cur, rate, o, ctx, stream } = S;
    const { m, pos, scl, q, tq, col, v3, l3 } = T;

    /* 01: rendered progress eases toward the target with elapsed time and
       lands exactly on it; the page reads it from a CSS variable. */
    const target = openTarget.get();
    const prevOpen = open.current;
    open.current = snap ? target : damp(open.current, target, 5.5, dt);
    if (Math.abs(open.current - target) < 5e-4) open.current = target;
    const P = open.current;
    if (section === "s01") {
      if (P !== prevOpen || frame.current === 1) openEls.section?.style.setProperty("--p01", P.toFixed(4));
      // the stream keeps moving; an entry slows to a stop as it leaves for the ridge
      if (motion)
        for (let i = 0; i < N; i++) {
          const f = entryBlend(P, OPEN_STAGGER[i]);
          stream[i] += dt * openSpeed(i) * (1 - smooth(f / 0.25));
          if (stream[i] > OPEN_SPAN / 2) stream[i] -= OPEN_SPAN;
        }
    }

    ctx.section = section;
    ctx.step = step;
    ctx.t = t;
    ctx.jstage = journeyStage.get();
    ctx.tracing = tracing;
    ctx.tstep = proof.step;
    ctx.entry = proof.entry ?? SPECIMEN;
    ctx.hover = interactive ? hover.current : null;
    ctx.hoverLayer = stack ? stackHover.get() : -1;
    ctx.p01 = P;
    const F = ctx.entry;
    const direct = section === "s01" && age.current > 2.5;

    /* entries */
    const mesh = ledger.current!;
    const glowAttr = entryGeo.getAttribute("aGlow") as THREE.InstancedBufferAttribute;
    for (let i = 0; i < N; i++) {
      layout(i, ctx, o);
      const b = i * STRIDE;
      const k = snap ? 1 : 1 - Math.pow(1 - (direct ? 0.25 : rate[i]), dt * 60);
      if (direct && Math.abs(o.x - cur[b]) > 10) cur[b] = o.x; // the stream wrapped, off screen
      cur[b] += (o.x - cur[b]) * k;
      cur[b + 1] += (o.y - cur[b + 1]) * k;
      cur[b + 2] += (o.z - cur[b + 2]) * k;
      cur[b + 3] += (o.sx - cur[b + 3]) * k;
      cur[b + 4] += (o.sy - cur[b + 4]) * k;
      cur[b + 5] += (o.sz - cur[b + 5]) * k;
      // rotation: target from (0, ry, rz), slerped along the shortest arc
      const hy = o.ry * 0.5;
      const hz = o.rz * 0.5;
      const cy = Math.cos(hy);
      const sy = Math.sin(hy);
      const cz = Math.cos(hz);
      const sz = Math.sin(hz);
      tq.set(sy * sz, sy * cz, cy * sz, cy * cz);
      q.set(cur[b + 6], cur[b + 7], cur[b + 8], cur[b + 9]).slerp(tq, k);
      cur[b + 6] = q.x;
      cur[b + 7] = q.y;
      cur[b + 8] = q.z;
      cur[b + 9] = q.w;
      cur[b + 10] += (o.tone - cur[b + 10]) * k;
      cur[b + 11] += (o.glow - cur[b + 11]) * k;
      m.compose(pos.set(cur[b], cur[b + 1], cur[b + 2]), q, scl.set(cur[b + 3], cur[b + 4], cur[b + 5]));
      mesh.setMatrixAt(i, m);
      col.copy(SILVER).multiplyScalar(cur[b + 10]);
      mesh.setColorAt(i, col);
      glowAttr.array[i] = cur[b + 11];
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    glowAttr.needsUpdate = true;
    // picking reads the rendered instances; keep the bounds current
    if (interactive || stack) mesh.boundingSphere = null;

    /* source towers */
    const showTowers = (section === "s02" && !tracing) || (section === "s05" && step === 4);
    const hotTower = section === "s02" && step === 0 ? towerOf(F) : -1;
    towerOn.current += ((showTowers ? 1 : 0) - towerOn.current) * (snap ? 1 : 1 - Math.pow(0.03, dt));
    const tw = towers.current!;
    TOWERS.forEach((p, k) => {
      const h = Math.max(0.001, towerOn.current);
      m.compose(pos.set(p.x, p.y * h, p.z), q.identity(), scl.set(1, h, 1));
      tw.setMatrixAt(k, m);
      tw.setColorAt(k, col.setScalar(k === hotTower ? 1.6 : 0.85));
    });
    tw.instanceMatrix.needsUpdate = true;
    if (tw.instanceColor) tw.instanceColor.needsUpdate = true;

    /* the reported line (02): where approved entries roll up */
    const showResult = section === "s02" && !tracing && step >= 2;
    resultOn.current += ((showResult ? 1 : 0) - resultOn.current) * (snap ? 1 : 1 - Math.pow(0.03, dt));
    const rs = result.current!;
    rs.scale.set(Math.max(0.001, resultOn.current), 1, 1);
    rs.visible = resultOn.current > 0.01;
    (rs.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.32 + (motion ? Math.sin(t * 1.6) * 0.08 : 0);
    tw.visible = towerOn.current > 0.01;

    /* light: each state's key, rim and environment, eased like the rest */
    const lt = lightFor(section, step);
    const kl = snap ? 1 : 1 - Math.exp(-3 * dt);
    keyLight.current!.intensity += (lt.key - keyLight.current!.intensity) * kl;
    rimLight.current!.intensity += (lt.rim - rimLight.current!.intensity) * kl;
    rimLight.current!.color.lerp(lt.rimColor, kl);
    scene.environmentIntensity += (lt.env - scene.environmentIntensity) * kl;

    /* filaments, pulses, evidence points */
    let ns = 0;
    let np = 0;
    let nv = 0;
    const Pt = (i: number) => [cur[i * STRIDE], cur[i * STRIDE + 1], cur[i * STRIDE + 2]] as const;
    const seg = (a: readonly number[], b: readonly number[]) => {
      if (ns >= MAXSEG) return;
      segPos.set([a[0], a[1], a[2], b[0], b[1], b[2]], ns * 6);
      ns++;
    };
    const pulse = (a: readonly number[], b: readonly number[], f: number) => {
      if (np >= 120) return;
      pulsePos.set([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f], np * 3);
      np++;
    };
    const violet = (x: number, y: number, z: number) => {
      if (nv >= 24) return;
      violetPos.set([x, y, z], nv * 3);
      nv++;
    };
    const feeds = (count: number) => {
      for (let k = 0; k < count; k++) {
        const i = (k * 211 + 37) % N;
        const tw = TOWERS[k % 5];
        const a = [tw.x, 0.35 * towerOn.current, tw.z + 0.3];
        const b = Pt(i);
        seg(a, b);
        pulse(a, b, (t * 0.35 + k * 0.137) % 1);
      }
    };
    const rect = (cx: number, y: number, hw: number, hd: number) => {
      const c = [
        [cx - hw, y, -hd],
        [cx + hw, y, -hd],
        [cx + hw, y, hd],
        [cx - hw, y, hd],
      ];
      for (let k = 0; k < 4; k++) seg(c[k], c[(k + 1) % 4]);
    };

    if (section === "s02" && tracing) {
      // the path through all five layers, travelled by a pulse
      const A = TRACE_ANCHORS;
      for (let k = 0; k < A.length - 1; k++) seg(A[k], A[k + 1]);
      for (let k = 0; k < A.length; k++) seg(A[k], [A[k][0] - 4.4, A[k][1], A[k][2]]);
      pulse(A[0], A[A.length - 1], (t * 0.22) % 1);
      const a = A[proof.step];
      violet(a[0], a[1] + 0.1, a[2]);
    } else if (section === "s02") {
      const base = (k: number) => [TOWERS[k].x, 0.35 * towerOn.current, TOWERS[k].z + 0.3];
      if (step <= 0) {
        // Connect: one event per source system travels into the flat ledger
        CONNECT_FEEDS.forEach((f, k) => {
          const a = base(f.tower);
          const b = Pt(f.entry);
          seg(a, b);
          pulse(a, b, connectPhase(k, t));
        });
        const tw = base(towerOf(F));
        seg(tw, Pt(F));
        pulse(tw, Pt(F), (t * 0.24 + 0.5) % 1);
      } else {
        // Reason: sources feed the tiers and eight chains climb source → logic
        // → entry. Prove: the chains reach review and the reported line, and
        // signals run through every link at once.
        const top = step >= 2 ? 3 : 2;
        const speed = step >= 2 ? 0.55 : 0.32;
        S02_CHAIN_DAYS.forEach((_, ch) => {
          const a = base(ch % 5);
          const b0 = Pt(s02Chain(ch, 0));
          seg(a, b0);
          pulse(a, b0, (t * speed + ch * 0.13) % 1);
          for (let k = 0; k < top; k++) {
            const p0 = Pt(s02Chain(ch, k));
            const p1 = Pt(s02Chain(ch, k + 1));
            seg(p0, p1);
            pulse(p0, p1, (t * speed + ch * 0.13 + (k + 1) * 0.25) % 1);
          }
          if (step >= 2) {
            // review checkpoints, then the reported line
            const r = Pt(s02Chain(ch, 3));
            violet(r[0], r[1] + 0.3, r[2]);
            const bar = [S02_RESULT[0] + (ch - 3.5) * 1.05, S02_RESULT[1] - 0.2, S02_RESULT[2]];
            seg(r, bar);
            pulse(r, bar, (t * speed + ch * 0.13 + 0.9) % 1);
            if (ch % 2 === 0) {
              // relationships across the tier: debit meets credit
              const q = Pt(s02Chain((ch + 3) % 8, 2));
              seg(Pt(s02Chain(ch, 2)), q);
            }
          }
        });
        // the entry in focus, from its source to where it sits
        const p = Pt(F);
        const tw = base(towerOf(F));
        seg(tw, p);
        pulse(tw, p, (t * 0.5) % 1);
        if (step >= 2) {
          const bar = [S02_RESULT[0] + (p[0] - S02_RESULT[0]) * 0.1, S02_RESULT[1] - 0.2, S02_RESULT[2]];
          seg(p, bar);
          pulse(p, bar, (t * 0.45 + 0.5) % 1);
          violet(S02_RESULT[0], S02_RESULT[1] + 0.5, S02_RESULT[2]);
        } else violet(p[0], p[1] + 0.28, p[2]);
      }
    } else if (section === "s03") {
      // one entry, threaded through every layer from the ledger up
      const th = Array.from({ length: STACK_LAYERS }, (_, k) => Pt(stackThread(k)));
      seg([th[0][0], 0.06, th[0][2]], th[0]);
      for (let k = 0; k < STACK_LAYERS - 1; k++) {
        seg(th[k], th[k + 1]);
        pulse(th[k], th[k + 1], (t * 0.5 + k * 0.2) % 1);
      }
      // violet marks the human review in the overview, the selected layer otherwise
      const v = th[step >= 1 ? step - 1 : 3];
      violet(v[0], v[1] + 0.3, v[2]);
    } else if (section === "s05") {
      if (step === 3)
        for (let i = 0; i < N; i += 37) {
          const p = Pt(i);
          seg(p, [gx(i % COLS), 0.06, gz(Math.floor(i / COLS))]);
          if (i % 111 === 0) violet(p[0], p[1] + 0.25, p[2]);
        }
      if (step === 4) feeds(36);
    } else if (section === "s06") {
      if (step >= 2) {
        for (let k = 0; k < 16; k += 2) {
          const a = Pt(225 + k * 7 + 6);
          const b = Pt(225 + 112 + k * 7);
          seg(a, b);
        }
        const mm = Pt(449);
        violet(mm[0], mm[1] + 0.7, mm[2]);
      }
      if (step >= 3) {
        seg([3.5, 2.3, 0], [3.5, 4.4, 0]);
        pulse([3.5, 2.3, 0], [3.5, 4.4, 0], (t * 0.35) % 1);
      }
    } else if (section === "s07") {
      const js = journeyStage.get();
      // the selected journey stage, marked on the floor under its plays
      for (let k = 0; k < 6; k++) {
        const a0 = playAt(js * 3 - 0.5 + k * 0.5, 0.04);
        const a1 = playAt(js * 3 - 0.5 + (k + 1) * 0.5, 0.04);
        seg(a0, a1);
      }
      if (step >= 1 && PLAYS[PC_PLAY].phase <= step) {
        const p = Pt(600 + PC_PLAY * 20 + 19);
        violet(p[0], p[1] + 0.35, p[2]);
      }
      if (step >= 2) {
        const live = (b: number) => !PLAYS[b].open && PLAYS[b].phase <= step;
        const topOf = (b: number) => Pt(600 + b * 20 + 19);
        for (let b = 0; b < 15; b++) {
          if (!live(b)) continue;
          const tp = topOf(b);
          // relationships: plays in the same stage connect across their tops
          if (b % 3 < 2 && live(b + 1)) {
            seg(tp, topOf(b + 1));
            pulse(tp, topOf(b + 1), (t * 0.4 + b * 0.19) % 1);
          }
          // evidence flows: every live play delivers into the launch window
          const land = dayAt(9 + ((b * 7) % 11), 1.95);
          seg(tp, land);
          pulse(tp, land, (t * 0.33 + b * 0.071) % 1);
        }
        if (step >= 3) {
          // Mature: the operating core links every live play
          const core = [3.5, 1.1, 0];
          for (let b = 0; b < 15; b += 1)
            if (live(b)) {
              const tp = topOf(b);
              seg(core, tp);
              pulse(tp, core, (t * 0.28 + b * 0.09) % 1);
            }
        }
      }
    } else if (section === "s08") {
      if (step === 3) {
        // Value: the month's old footprint, and a frame contracting onto the block
        rect(M8, 0.03, 8.4, 5.2);
        const e = smooth((t * 0.32) % 1);
        rect(M8, 0.04, 8.4 + (1.95 - 8.4) * e, 5.2 + (1.95 - 5.2) * e);
      } else if (step === 4) {
        // Trust: result to gate to entries to sources, every link inspectable
        const top = [M8, TRUST.resY, 0];
        const gate = [M8, TRUST.gateY, 0];
        seg(top, gate);
        pulse(gate, top, (t * 0.4) % 1);
        trustLinks.forEach((s, k) => {
          const en = Pt(300 + s);
          const so = Pt(s);
          seg(gate, en);
          seg(en, so);
          pulse(so, en, (t * 0.35 + k * 0.125) % 1);
          pulse(en, gate, (t * 0.35 + k * 0.125 + 0.5) % 1);
        });
        violet(gate[0], gate[1], gate[2]);
      } else if (step === 5) {
        const p = Pt(3 * 225 + 224);
        violet(p[0] - 1.1, p[1] + 0.3, p[2] - 1.1);
      }
    }

    const lg = lines.current!.geometry;
    (lg.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    lg.setDrawRange(0, ns * 2);
    const pg = pulses.current!.geometry;
    (pg.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    pg.setDrawRange(0, np);
    const vg = violets.current!.geometry;
    (vg.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    vg.setDrawRange(0, nv);
    const vm = violets.current!.material as THREE.PointsMaterial;
    vm.size = 0.9 + (motion ? Math.sin(t * 2.2) * 0.12 : 0);

    /* placement for the slide, plus drag-to-turn yaw */
    const pl = place(section, tracing);
    const kp = snap ? 1 : 1 - Math.pow(0.08, dt);
    const g = group.current!;
    g.position.x += (pl.x - g.position.x) * kp;
    g.position.z += (pl.z - g.position.z) * kp;
    g.scale.setScalar(g.scale.x + (pl.s - g.scale.x) * kp);
    const y = yaw.current;
    y.v += (y.target - y.v) * (snap ? 1 : 1 - Math.pow(0.02, dt));
    g.rotation.y = y.v;

    /* camera: one controller. Position eases to the slide's pose, and the
       orientation slerps to look at its target, both with elapsed time. On
       01 the pose follows the rendered progress, and the horizontal
       parallax is off: horizontal movement belongs to the month there. */
    let ps: Pose;
    if (section === "s01" && !TUNE.pose["s01"]) {
      const a = pose("s01", 0);
      const b = pose("s01", 1);
      const f = smooth(P);
      ps = { p: [0, 1, 2].map((n) => a.p[n] + (b.p[n] - a.p[n]) * f) as Pose["p"], l: [0, 1, 2].map((n) => a.l[n] + (b.l[n] - a.l[n]) * f) as Pose["l"] };
    } else ps = pose(section, step, tracing);
    const aspect = size.width / size.height;
    // Portrait screens pull the camera back a little and centre the object;
    // the fog moves with it so nothing dissolves.
    // On 03 the layer card needs the left half: narrower desktop screens pull
    // the camera back and slide the stack right to keep them apart.
    const wide = section === "s03" && step >= 1 && aspect >= 1.3 && aspect < 1.75 ? 1.75 / aspect : 1;
    const fz = aspect < 1.3 ? Math.min(1.75, 1.2 / aspect) : wide;
    // On a portrait 01 the camera follows the pile as the month closes, so
    // both ends are whole compositions.
    const lx =
      aspect < 1.3
        ? section === "s01"
          ? ps.l[0] + smooth(P) * 5
          : section === "s03"
            ? pl.x + 0.3 // the stack's centre
            : section === "s02"
              ? pl.x // the ledger's centre
              : section === "s07"
                ? pl.x + 3.5 * pl.s // the ring's centre
                : ps.l[0] + (pl.x - ps.l[0]) * 0.6
        : ps.l[0] - (wide - 1) * 11;
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      fog.near = 26 * fz;
      fog.far = 62 * fz;
    }
    // portrait: 01 sits above its headline; 02, 03, 07 and 08 in the gap under theirs
    const ly = ps.l[1] - (aspect >= 1.3 ? 0 : section === "s01" ? 2.4 : section === "s03" ? 1.9 : section === "s08" ? -0.7 : section === "s02" ? -1.2 : section === "s07" ? 0.6 : 0);
    v3.set(lx + (ps.p[0] - ps.l[0]) * fz, ly + (ps.p[1] - ps.l[1]) * fz, ps.l[2] + (ps.p[2] - ps.l[2]) * fz);
    if (motion) {
      if (section !== "s01") v3.x += mouse.current.x * 1.4;
      v3.y -= mouse.current.y * 0.8;
    }
    l3.set(lx, ly, ps.l[2]);
    T.look.lookAt(v3, l3, camera.up);
    tq.setFromRotationMatrix(T.look);
    const kc = snap ? 1 : 1 - Math.pow(0.12, dt);
    camPos.current.lerp(v3, kc);
    camQ.current.slerp(tq, kc);
    camera.position.copy(camPos.current);
    camera.quaternion.copy(camQ.current);
    camera.updateMatrixWorld();

    /* labels and markers follow their anchors on screen */
    g.updateMatrixWorld();
    const toScreen = (el: HTMLElement, x: number, yy: number, z: number) => {
      v3.set(x, yy, z).applyMatrix4(g.matrixWorld).project(camera);
      el.style.transform = `translate(${((v3.x + 1) / 2) * size.width}px, ${((1 - v3.y) / 2) * size.height}px)`;
      return v3.z < 1 && Math.abs(v3.x) < 1.05 && Math.abs(v3.y) < 1.05;
    };
    const sides: { el: HTMLElement; x: number; y: number }[] = [];
    labels.forEach((l, k) => {
      const el = labelEls.current[k];
      if (!el) return;
      el.style.opacity = toScreen(el, l.at[0], l.at[1], l.at[2]) ? "1" : "0";
      // a side label near the right edge sits on the other side of its column
      if (l.side) {
        const x = ((v3.x + 1) / 2) * size.width;
        const flip = x > size.width - 240;
        if (flip !== (el.dataset.flip !== undefined)) flip ? (el.dataset.flip = "") : delete el.dataset.flip;
        sides.push({ el, x, y: ((1 - v3.y) / 2) * size.height });
      }
    });
    // side labels never overlap: a label that would cover another moves down a line
    sides.sort((a, b) => a.y - b.y);
    for (let a = 1; a < sides.length; a++)
      for (let b = 0; b < a; b++)
        if (Math.abs(sides[a].x - sides[b].x) < 230 && sides[a].y - sides[b].y < 26) sides[a].y = sides[b].y + 26;
    sides.forEach((p) => (p.el.style.transform = `translate(${p.x}px, ${p.y}px)`));
    // trace markers (buttons in the page) sit on their ledger layers
    if (tracing)
      TRACE_ANCHORS.forEach((a, k) => {
        const el = markerEls[k];
        if (el) toScreen(el, a[0], a[1], a[2]);
      });
    /* 03 hotspots hang from each layer's rendered edge cell. Off screen or
       behind the camera they hide; when another layer stands between the
       camera and the anchor they fade and stop taking the pointer. The
       occlusion ray runs every sixth frame against the rendered instances. */
    if (stack) {
      const test = frame.current % 6 === 0;
      for (let k = 0; k < STACK_LAYERS; k++) {
        const el = hotspotEls[k];
        if (!el) continue;
        const a = Pt(stackAnchor(k));
        const onScreen = toScreen(el, a[0] + 0.55, a[1] + 0.05, a[2]);
        if (test && onScreen) {
          const w = l3.set(a[0] + 0.55, a[1] + 0.05, a[2]).applyMatrix4(g.matrixWorld);
          const dist = camera.position.distanceTo(w);
          T.ray.set(camera.position, w.sub(camera.position).normalize());
          T.ray.far = dist - 0.15;
          T.hits.length = 0;
          mesh.raycast(T.ray, T.hits);
          occluded.current[k] = T.hits.some((h) => h.instanceId !== undefined && layerOfEntry(h.instanceId) !== k && layerOfEntry(h.instanceId) >= 0);
        }
        const state = !onScreen ? "off" : occluded.current[k] ? "behind" : "on";
        if (el.dataset.vis !== state) el.dataset.vis = state;
        // near the right edge the label sits on the other side of its dot
        const side = ((v3.x + 1) / 2) * size.width > size.width - 200 ? "l" : "r";
        if (el.dataset.side !== side) el.dataset.side = side;
      }
    }
    if (process.env.NODE_ENV !== "production") {
      // dev only: what this state draws (links, travelling signals, review points)
      (window as unknown as { __erpStats?: object }).__erpStats = { links: ns, signals: np, points: nv };
      const w = window as unknown as { __erpMs?: number[] };
      (w.__erpMs ??= []).push(performance.now() - t0);
      if (w.__erpMs.length > 120) w.__erpMs.shift();
    }
  });

  /* ---- picking: 02 entries (hover lifts, click traces) and 03 layers
     (hover lights the layer, click selects it). Both read instanceId from
     the rendered instances, so what is under the pointer is what you get. */
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (interactive) {
      e.stopPropagation();
      hover.current = e.instanceId ?? null;
      document.body.style.cursor = e.instanceId !== undefined ? "pointer" : "";
    } else if (stack) {
      const k = e.instanceId === undefined ? -1 : layerOfEntry(e.instanceId);
      stackHover.set(k);
      document.body.style.cursor = k >= 0 ? "pointer" : "";
    }
  };
  const onOut = () => {
    hover.current = null;
    if (stack) stackHover.set(-1);
    document.body.style.cursor = "";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6 || e.instanceId === undefined) return;
    if (interactive) {
      e.stopPropagation();
      worldStore.dispatch({ type: "open", entry: e.instanceId });
    } else if (stack) {
      const k = layerOfEntry(e.instanceId);
      if (k < 0) return;
      e.stopPropagation();
      onStep("s03", stepOfLayer(k));
    }
  };
  useEffect(() => {
    if (stack) return;
    stackHover.set(-1);
    document.body.style.cursor = "";
  }, [stack]);
  const picking = interactive || stack;

  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight
        ref={keyLight}
        position={[-14, 18, 9]}
        intensity={STUDIO.key}
        color="#fff4ea"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-bias={-0.0004}
      />
      <directionalLight ref={rimLight} position={[12, 7, -16]} intensity={STUDIO.rim} color={RIM} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[260, 260]} />
        <meshStandardMaterial color="#0b0b0d" metalness={0.05} roughness={0.92} envMapIntensity={0.25} />
      </mesh>
      <group ref={group}>
        <instancedMesh
          ref={ledger}
          args={[entryGeo, metal, N]}
          castShadow
          receiveShadow
          frustumCulled={false}
          onPointerMove={picking ? onMove : undefined}
          onPointerOut={picking ? onOut : undefined}
          onClick={picking ? onClick : undefined}
        />
        <instancedMesh ref={towers} args={[towerGeo, towerMat, 5]} castShadow receiveShadow frustumCulled={false} />
        <mesh ref={result} position={S02_RESULT} castShadow>
          <boxGeometry args={[9, 0.32, 0.9]} />
          <meshStandardMaterial color="#d9d7dc" metalness={0.8} roughness={0.25} emissive="#ffffff" emissiveIntensity={0.18} />
        </mesh>
        <lineSegments ref={lines} frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[segPos, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#f2f1f6" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} fog />
        </lineSegments>
        <points ref={pulses} frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[pulsePos, 3]} />
          </bufferGeometry>
          <pointsMaterial map={tex} size={0.34} color="#ffffff" transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
        </points>
        <points ref={violets} frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[violetPos, 3]} />
          </bufferGeometry>
          <pointsMaterial map={tex} size={0.9} color={VIOLET} transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation toneMapped={false} />
        </points>
      </group>
    </>
  );
}

/* ------------------------------------------------------------- world */

export default function World({ section, step, motion, reduced, hidden }: { section: string; step: number; motion: boolean; reduced: boolean; hidden: boolean }) {
  const labelEls = useRef<(HTMLDivElement | null)[]>([]);
  const proof = useWorld();
  const { setStep } = useDeck();
  const tracing = section === "s02" && proof.tracing;
  const turnable = section === "s02" && !tracing && !hidden;
  const jstage = useJourney();
  const labels = useMemo(() => labelsFor(section, step, tracing, jstage), [section, step, tracing, jstage]);
  // A background tab renders nothing.
  const [pageHidden, setPageHidden] = useState(false);
  useEffect(() => {
    const on = () => setPageHidden(document.hidden);
    on();
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  // Leaving 02 always closes the trace, so returning starts clean.
  useEffect(() => {
    if (section !== "s02" && worldStore.get().tracing) worldStore.dispatch({ type: "exit" });
  }, [section]);
  // Dev only: live tuning, and frame stepping for automated checks. With
  // ?awake a hidden page keeps the scene live but paused, and
  // window.__advance(seconds) renders one frame at that time.
  const [awake, setAwake] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as { __erp: typeof TUNE }).__erp = TUNE;
    (window as unknown as { __advance: typeof advance }).__advance = advance;
    setAwake(new URLSearchParams(window.location.search).has("awake"));
  }, []);

  const off = hidden || (pageHidden && !awake);
  return (
    <div className={`world${hidden ? " is-hidden" : ""}${turnable ? " no-swipe" : ""}`} data-section={section} data-tracing={tracing || undefined} data-reduced={reduced || undefined}>
      <Canvas
        className="world-canvas"
        dpr={[1, 1.75]}
        shadows
        frameloop={off || pageHidden ? "never" : "always"}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 30, near: 0.1, far: 140, position: [-6, 3.6, 22] }}
        style={{ touchAction: "pan-y" }}
      >
        <Scene section={section} step={step} motion={motion} hidden={off} turnable={turnable} labels={labels} labelEls={labelEls} proof={proof} onStep={setStep} />
      </Canvas>
      <div className="w-veil" aria-hidden="true" />
      <div className="w-grain" aria-hidden="true" />
      <div className="w-labels" aria-hidden="true">
        {labels.map((l, k) => (
          <div key={l.key} className={`w-label lbl${l.side ? " side" : ""}${l.tone ? ` ${l.tone}` : ""}`} ref={(el) => void (labelEls.current[k] = el)}>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
