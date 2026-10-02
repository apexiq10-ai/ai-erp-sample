"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { appendixList, sections, site, type Mode } from "@/content";
import { DeckContext, SectionContext, type SectionState } from "@/components/ui";
import { worldStore } from "@/components/world/store";
import { S01, S02, S03, S05, S06, S07, S08 } from "@/components/sections/Main";
import { S04, S09 } from "@/components/sections/Scenes";
import { Appendix } from "@/components/sections/Appendix";

// The 3D world is client-only (WebGL) and loads after first paint.
const World = dynamic(() => import("@/components/world/World"), { ssr: false });

const VIEWS: Record<string, ComponentType> = { s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06, s07: S07, s08: S08, s09: S09, apx: Appendix };

const N = sections.length;
const MAX = sections.map((s) => s.steps);
const READ = sections.map((s) => s.read);
// Scrubbed sections: one viewport of scroll per build (02).
const SCRUB = sections.map((s) => !!s.scrub);
const APX = sections.findIndex((s) => s.part === "appendix");
const LAST_MAIN = sections.filter((s) => s.part === "main").length;
const MAIN = sections.slice(0, LAST_MAIN);
// Sections whose builds rest at a chosen state when jumped to or stepped back into.
const jumpStep = (i: number) => (i === 0 ? 0 : READ[i]);
const backStep = (i: number) => (sections[i].id === "s07" ? READ[i] : MAX[i]);
// Footer qualifier per section: the evidence status of what is on screen.
const TAGS: Record<string, string> = {
  s01: "Illustrative motion · not ledger data",
  s02: "Illustrative · not customer data",
  s03: "Inference · step mapping",
  s04: "Illustrative motion · not product footage",
  s05: "Persona map · hypothesis to validate",
  s06: "Illustrative motion · not ledger data",
  s07: "Illustrative motion · not ledger data",
  s08: "Value not set · targets come from the Harvest baselines",
  s09: "Illustrative motion · not product footage",
  apx: "Claimed · stated by the company, not independently demonstrated",
};

const modeAt = (i: number, step: number): Mode => {
  const m = sections[i].modes;
  return m[Math.min(step, m.length - 1)];
};

const parseAnchor = (hash: string): [number, number] | null => {
  const m = /^a([1-9])$/.exec(hash);
  if (m) return [APX, Number(m[1]) - 1];
  const i = sections.findIndex((s) => s.id === hash);
  return i >= 0 ? [i, jumpStep(i)] : null;
};

type Driver = "scroll" | "key";

export default function Deck() {
  const [steps, setSteps] = useState<number[]>(() => sections.map(() => 0));
  const [arrivals, setArrivals] = useState<number[]>(() => sections.map(() => 0));
  const [cur, setCur] = useState(0);
  const [onScreen, setOnScreen] = useState<boolean[]>(() => sections.map((_, i) => i === 0));
  const [driver, setDriver] = useState<Driver>("scroll");
  const [indexOpen, setIndexOpen] = useState(false);
  const [overlay, setOverlay] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);
  const [motionOn, setMotionOn] = useState(true);
  const [ready, setReady] = useState(false);

  const els = useRef<(HTMLElement | null)[]>([]);
  const stepsRef = useRef(steps);
  const curRef = useRef(cur);
  const driverRef = useRef(driver);
  const overlayRef = useRef(overlay);
  useEffect(() => {
    stepsRef.current = steps;
    curRef.current = cur;
    driverRef.current = driver;
    overlayRef.current = overlay;
  });

  const motion = motionOn && !reduced;

  // Scroll to a section, or on a scrubbed section to the viewport that holds the build.
  const scrollTop = (i: number, step = 0) => {
    const el = els.current[i];
    if (!el) return;
    const zone = SCRUB[i] ? el.querySelectorAll<HTMLElement>(".stage-zones > div")[step] : null;
    const top = (zone ?? el).getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
  };

  const setStepAt = useCallback((i: number, s: number) => {
    const v = Math.max(0, Math.min(MAX[i], s));
    if (stepsRef.current[i] === v) return;
    const next = stepsRef.current.slice();
    next[i] = v;
    stepsRef.current = next;
    setSteps(next);
  }, []);

  const goTo = useCallback(
    (i: number, step: number) => {
      const idx = Math.max(0, Math.min(N - 1, i));
      setOverlay(null);
      setStepAt(idx, step);
      setArrivals((prev) => {
        const next = prev.slice();
        next[idx] += 1;
        return next;
      });
      setCur(idx);
      curRef.current = idx;
      scrollTop(idx, stepsRef.current[idx]);
    },
    [setStepAt],
  );

  const goToId = useCallback(
    (id: string) => {
      const t = parseAnchor(id);
      if (t) {
        setIndexOpen(false);
        goTo(t[0], t[1]);
      }
    },
    [goTo],
  );

  /* Forward: next build, then next section. Down keys scroll a section
     taller than the screen before leaving it. */
  const next = useCallback(
    (scrollFirst: boolean) => {
      const i = curRef.current;
      const s = stepsRef.current[i];
      const el = els.current[i];
      if (scrollFirst && !SCRUB[i] && (i === APX || s >= MAX[i]) && el) {
        const r = el.getBoundingClientRect();
        if (r.bottom > window.innerHeight + 8) {
          window.scrollBy({ top: Math.min(r.bottom - window.innerHeight, window.innerHeight * 0.8), behavior: "instant" as ScrollBehavior });
          return;
        }
      }
      if (s < MAX[i]) {
        setStepAt(i, s + 1);
        if (i === APX || SCRUB[i]) scrollTop(i, s + 1);
        return;
      }
      if (i < N - 1) goTo(i + 1, 0);
    },
    [goTo, setStepAt],
  );

  const prev = useCallback(
    (scrollFirst: boolean) => {
      const i = curRef.current;
      const s = stepsRef.current[i];
      const el = els.current[i];
      if (scrollFirst && !SCRUB[i] && el) {
        const r = el.getBoundingClientRect();
        if (r.top < -8) {
          window.scrollBy({ top: Math.max(r.top, -window.innerHeight * 0.8), behavior: "instant" as ScrollBehavior });
          return;
        }
      }
      if (s > 0) {
        setStepAt(i, s - 1);
        if (i === APX || SCRUB[i]) scrollTop(i, s - 1);
        return;
      }
      if (i > 0) goTo(i - 1, i - 1 === APX ? 0 : backStep(i - 1));
    },
    [goTo, setStepAt],
  );

  const advance = useCallback((d: 1 | -1) => (d > 0 ? next(false) : prev(false)), [next, prev]);

  /* ---- mount: reduced motion, presenter flag; every load opens on 01 */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    const params = new URLSearchParams(window.location.search);
    if (params.has("present")) setDriver("key");
    if (params.has("still")) setMotionOn(false);
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
    window.scrollTo(0, 0);
    const t = window.setTimeout(() => {
      window.scrollTo(0, 0);
      setReady(true);
    }, 0);
    return () => {
      window.clearTimeout(t);
      mq.removeEventListener("change", apply);
    };
  }, []);

  /* ---- which section holds the viewport (the one crossing its midline) */
  useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight;
      const vis = els.current.map((el) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < vh;
      });
      setOnScreen((p) => (p.length === vis.length && p.every((v, k) => v === vis[k]) ? p : vis));
      const mid = vh / 2;
      const i = els.current.findIndex((el) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top <= mid && r.bottom > mid;
      });
      if (i >= 0 && i !== curRef.current) {
        if (i === APX) setStepAt(APX, 0);
        curRef.current = i;
        setCur(i);
        setOverlay(null);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [setStepAt]);

  /* ---- reading mode: sections rest in their reading state before they
     scroll in, so the page never passes through a half-built frame */
  useEffect(() => {
    if (driver !== "scroll" || !ready) return;
    sections.forEach((_, i) => {
      if (i > 0 && !SCRUB[i] && stepsRef.current[i] < READ[i]) setStepAt(i, READ[i]);
    });
  }, [driver, ready, setStepAt]);

  /* ---- input: keys to the presenter, wheel and touch to the reader,
     horizontal swipes step like arrow keys */
  useEffect(() => {
    const toScroll = () => driverRef.current !== "scroll" && setDriver("scroll");
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target instanceof HTMLElement ? e.target : null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const k = e.key;
      const tracing = worldStore.get().tracing;
      if (k === "Escape") {
        setIndexOpen(false);
        setOverlay(null);
        if (tracing) worldStore.dispatch({ type: "exit" });
        // 03: Escape leaves the selected layer for the stack's overview
        const i = curRef.current;
        if (!overlayRef.current && sections[i].id === "s03" && stepsRef.current[i] > 0) setStepAt(i, 0);
        return;
      }
      // An open detail layer owns its own arrows (see Scenes.tsx).
      if (overlayRef.current) return;
      // A tablist moves its own selection with the arrows.
      if (t?.closest('[role="tablist"]') && /^Arrow|^Home$|^End$/.test(k)) return;
      // While an entry is being traced, the arrows walk its five steps.
      if (tracing && /^Arrow/.test(k)) {
        e.preventDefault();
        worldStore.dispatch({ type: k === "ArrowRight" || k === "ArrowDown" ? "next" : "back" });
        return;
      }
      if (k === "i" || k === "I") return setIndexOpen((v) => !v);
      if (k === "m" || k === "M") return setMotionOn((v) => !v);
      const right = k === "ArrowRight" || k === "PageDown" || (k === "Enter" && !(t && /BUTTON|A/.test(t.tagName))) || (k === " " && !e.shiftKey);
      const down = k === "ArrowDown";
      const left = k === "ArrowLeft" || k === "PageUp" || k === "Backspace" || (k === " " && e.shiftKey);
      const up = k === "ArrowUp";
      const nav = right || down || left || up || ["Home", "End", "a", "A"].includes(k) || /^[1-9]$/.test(k);
      if (!nav) return;
      e.preventDefault();
      setIndexOpen(false);
      setDriver("key");
      driverRef.current = "key";
      if (right) return next(false);
      if (down) return next(true);
      if (left) return prev(false);
      if (up) return prev(true);
      if (k === "Home") return goTo(0, 0);
      if (k === "End") return goTo(LAST_MAIN - 1, MAX[LAST_MAIN - 1]);
      if (k === "a" || k === "A") return goTo(APX, 0);
      if (/^[1-9]$/.test(k)) {
        const i = sections.findIndex((s) => s.index === `0${k}`);
        if (i >= 0) goTo(i, jumpStep(i));
      }
    };
    let x0: number | null = null;
    let y0 = 0;
    const onTouchStart = (e: TouchEvent) => {
      x0 = e.touches[0]?.clientX ?? null;
      y0 = e.touches[0]?.clientY ?? 0;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (x0 === null || overlayRef.current) return;
      const t = e.target instanceof HTMLElement ? e.target : null;
      if (t?.closest("button, a, input, canvas, .no-swipe")) return;
      const dx = (e.changedTouches[0]?.clientX ?? x0) - x0;
      const dy = (e.changedTouches[0]?.clientY ?? y0) - y0;
      x0 = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", toScroll, { passive: true });
    window.addEventListener("touchmove", toScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", toScroll);
      window.removeEventListener("touchmove", toScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [next, prev, goTo, setStepAt]);

  // Overlays lock page scroll underneath.
  useEffect(() => {
    document.documentElement.classList.toggle("locked", !!overlay || indexOpen);
  }, [overlay, indexOpen]);

  const registers = useMemo(() => sections.map((_, i) => (el: HTMLElement | null) => (els.current[i] = el)), []);
  const setStep = useCallback(
    (id: string, step: number, opts?: { scroll?: boolean }) => {
      const i = sections.findIndex((s) => s.id === id);
      if (i < 0) return;
      setStepAt(i, step);
      if (SCRUB[i] && opts?.scroll !== false) scrollTop(i, step);
    },
    [setStepAt],
  );
  const deck = useMemo(() => ({ goToId, advance, setStep, overlay, setOverlay }), [goToId, advance, setStep, overlay]);

  const meta = sections[cur];
  const apxStep = steps[APX];
  const isApx = cur === APX;
  const position = isApx ? `A${apxStep + 1}` : meta.index;
  const subject = isApx ? appendixList[apxStep].title : meta.subject;

  return (
    <DeckContext.Provider value={deck}>
      <World
        section={meta.id}
        step={steps[cur]}
        motion={motion}
        reduced={reduced}
        hidden={meta.id === "s04" || meta.id === "s09" || isApx}
      />

      <header className="chrome" data-mode={modeAt(cur, steps[cur])} inert={!!overlay || undefined}>
        <button className="identity" onClick={() => goTo(0, 0)} aria-label={`${site.system}: back to the start`}>
          {site.system}
        </button>
        <div className="controls">
          <span className="lbl note">{site.note}</span>
          <button
            className="lbl ctl"
            onClick={() => setMotionOn((v) => !v)}
            aria-pressed={!motionOn}
            aria-label={motionOn ? "Pause motion" : "Resume motion"}
            disabled={reduced}
          >
            {site.motion} <span className="acc">{motion ? site.on : site.off}</span>
          </button>
          <button className="lbl ctl" onClick={() => setIndexOpen((v) => !v)} aria-expanded={indexOpen} aria-controls="index">
            {site.index} <span className="acc plus">{indexOpen ? "×" : "+"}</span>
          </button>
        </div>
      </header>

      <main>
        {sections.map((s, i) => {
          const View = VIEWS[s.id];
          const state: SectionState = {
            i,
            id: s.id,
            part: s.part,
            label: `${s.index} ${s.subject}`,
            step: steps[i],
            mode: modeAt(i, steps[i]),
            active: i === cur,
            onScreen: onScreen[i] || i === cur,
            reading: driver === "scroll",
            reduced,
            motion,
            arrival: arrivals[i],
            register: registers[i],
          };
          return (
            <SectionContext.Provider key={s.id} value={state}>
              <View />
            </SectionContext.Provider>
          );
        })}
      </main>

      <footer className="dock" data-mode={modeAt(cur, steps[cur])} inert={!!overlay || undefined}>
        <div className="dock-left lbl">
          <span className="live" aria-hidden="true" />
          <span>{site.footer}</span>
        </div>
        <div className="dock-nav">
          <button onClick={() => prev(false)} aria-label="Previous" disabled={cur === 0 && steps[0] === 0}>
            ←
          </button>
          <span className="lbl">
            <span className="acc">{position}</span> / {subject}
          </span>
          <button onClick={() => next(false)} aria-label="Next" disabled={isApx && apxStep >= MAX[APX]}>
            →
          </button>
        </div>
        <div className="dock-right lbl">{TAGS[meta.id]}</div>
      </footer>

      {indexOpen && (
        <nav className="index" id="index" aria-label="Index" data-mode="night">
          <p className="lbl idx-head">
            <span>{site.story}</span>
            <span>01 / 09</span>
          </p>
          <ol>
            {MAIN.map((s, i) => (
              <li key={s.id}>
                <button
                  aria-current={i === cur}
                  onClick={() => {
                    setIndexOpen(false);
                    goTo(i, jumpStep(i));
                  }}
                >
                  <span className="n">{s.index}</span>
                  <strong>{s.subject}</strong>
                </button>
              </li>
            ))}
          </ol>
          <p className="lbl idx-head">
            <span>{sections[APX].subject}</span>
            <span>A1 / A{appendixList.length}</span>
          </p>
          <ol className="apx-list">
            {appendixList.map((a, k) => (
              <li key={a.id}>
                <button
                  aria-current={isApx && apxStep === k}
                  onClick={() => {
                    setIndexOpen(false);
                    goTo(APX, k);
                  }}
                >
                  <span className="n">{a.index}</span>
                  <strong>{a.title}</strong>
                  <small>{a.headline}</small>
                </button>
              </li>
            ))}
          </ol>
          <p className="lbl idx-foot">{site.keys}</p>
        </nav>
      )}
    </DeckContext.Provider>
  );
}

