"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { s04, s09, sections } from "@/content";
import { Film, Frame, Mark, pad2, useDeck, useSection } from "@/components/ui";

/* 04 and 09: the two Runway films, full bleed, with every word and control
   in code. Each opens one full-screen editorial layer: 04 descends through
   the evidence under one number, 09 walks the proposed Parallel Close. */

const TOTAL = pad2(sections.filter((s) => s.part === "main").length);

type SceneData = {
  topline: string;
  title: string[];
  support: string;
  explore: string[];
  side: string;
};

function RunwayScene({
  id,
  film,
  data,
  descend = 0,
  layer,
}: {
  id: string;
  film: string;
  data: SceneData;
  descend?: number;
  layer: (close: () => void) => ReactNode;
}) {
  const { onScreen, motion, i } = useSection();
  const { overlay, setOverlay } = useDeck();
  const open = overlay === id;
  const opener = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const filmBox = useRef<HTMLDivElement>(null);

  // Focus returns to the button that opened the layer.
  useEffect(() => {
    if (wasOpen.current && !open) opener.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  // A slow pan with the pointer, so the film feels like a place.
  const onPointerMove = (e: React.PointerEvent) => {
    if (!motion || e.pointerType !== "mouse" || !filmBox.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    filmBox.current.style.setProperty("--pan-x", `${(((e.clientX - r.left) / r.width - 0.5) * -18).toFixed(1)}px`);
    filmBox.current.style.setProperty("--pan-y", `${(((e.clientY - r.top) / r.height - 0.5) * -12).toFixed(1)}px`);
  };

  const [a, b, c] = data.title;
  return (
    <Frame
      className={`scene ${id}`}
      media={
        <div className="scene-media" ref={filmBox} onPointerMove={onPointerMove} style={{ "--descend": descend } as CSSProperties}>
          <Film name={film} play={onScreen && motion} />
          <div className="scene-shade" aria-hidden="true" />
          <div className="w-grain" aria-hidden="true" />
        </div>
      }
      after={open && layer(() => setOverlay(null))}
    >
      <div className="topline lbl">
        <span className="acc">
          {sections[i].index} / {TOTAL}
        </span>
        <span>{data.topline}</span>
      </div>
      <h2 className="display hero">
        {a}
        <br />
        {b}
        <br />
        <em>{c}</em>
      </h2>
      <div className="scene-bottom">
        <p className="support">{data.support}</p>
        <button ref={opener} className="explore" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOverlay(id)}>
          <span className="plus" aria-hidden="true">
            +
          </span>
          <span className="lbl">
            {data.explore[0]}
            <br />
            {data.explore[1]}
          </span>
        </button>
      </div>
      <p className="side-note lbl" aria-hidden="true">
        {data.side}
      </p>
    </Frame>
  );
}

/* ------------------------------------------------- full-screen layer
   A modal dialog with its own keys: ← → ↑ ↓ move, Tab stays inside,
   Escape closes (handled by the deck), a horizontal swipe moves too. */

function Layer({
  label,
  closeLabel,
  onClose,
  count,
  at,
  set,
  children,
}: {
  label: string;
  closeLabel: string;
  onClose: () => void;
  count: number;
  at: number;
  set: (n: number) => void;
  children: (closeRef: RefObject<HTMLButtonElement | null>) => ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const atRef = useRef(at);
  atRef.current = at;

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "ArrowRight" || k === "ArrowDown" || k === "PageDown" || (k === " " && !(e.target as HTMLElement)?.closest("button"))) {
        e.preventDefault();
        set((atRef.current + 1) % count);
      } else if (k === "ArrowLeft" || k === "ArrowUp" || k === "PageUp") {
        e.preventDefault();
        set((atRef.current - 1 + count) % count);
      } else if (k === "Tab" && box.current) {
        const f = [...box.current.querySelectorAll<HTMLElement>("button:not([disabled])")];
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, set]);

  const x0 = useRef<number | null>(null);
  return createPortal(
    <div
      className="detail"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      ref={box}
      onTouchStart={(e) => (x0.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (x0.current === null || (e.target as HTMLElement).closest("button")) return;
        const dx = (e.changedTouches[0]?.clientX ?? x0.current) - x0.current;
        if (Math.abs(dx) > 70) set((atRef.current + (dx < 0 ? 1 : -1) + count) % count);
        x0.current = null;
      }}
    >
      <div className="detail-head">
        <span className="lbl acc">{label}</span>
        <button ref={closeRef} className="lbl ctl" onClick={onClose}>
          {closeLabel} <span className="acc x">×</span>
        </button>
      </div>
      {children(closeRef)}
    </div>,
    document.body,
  );
}

/* 04 · the core sample: five layers under one number ------------------- */

function Evidence({ onClose, at, set }: { onClose: () => void; at: number; set: (n: number) => void }) {
  const d = s04.detail;
  const L = d.layers[at];
  const last = at === d.layers.length - 1;
  return (
    <Layer label={d.label} closeLabel={d.close} onClose={onClose} count={d.layers.length} at={at} set={set}>
      {() => (
        <div className="detail-body evidence">
          <div className="detail-left">
            <p className="display lg">
              {d.head[0]}
              <br />
              {d.head[1]}
              <br />
              <em>{d.head[2]}</em>
            </p>
            <div className="notes">
              <Mark kind="illustrative">{d.note}</Mark>
              <Mark kind="claimed">{d.claimed}</Mark>
            </div>
          </div>
          <div className="detail-right">
            <div className="core" aria-hidden="true" style={{ "--at": at } as CSSProperties}>
              {d.layers.map((l, n) => (
                <span key={l.short} className={n === at ? "on" : n < at ? "past" : ""} />
              ))}
              <i className="probe" />
            </div>
            <p className="lbl acc count">
              {pad2(at + 1)} / {pad2(d.layers.length)}
            </p>
            <div className="detail-main descend" key={at} aria-live="polite">
              <span className="lbl acc">{L.kicker}</span>
              <strong className="display md">{L.value}</strong>
              <p className="support">{L.detail}</p>
            </div>
            <div className="detail-nav" role="group" aria-label={d.label}>
              {d.layers.map((l, n) => (
                <button key={l.short} aria-pressed={n === at} onClick={() => set(n)}>
                  {pad2(n + 1)} <span>{l.short}</span>
                </button>
              ))}
            </div>
            <button className="detail-next lbl" onClick={() => set(last ? 0 : at + 1)}>
              {last ? d.back : d.next} <span className="acc">{last ? "↑" : "↓"}</span>
            </button>
          </div>
        </div>
      )}
    </Layer>
  );
}

/* 09 · the Parallel Close: scope, replay, tie out, decide --------------- */

function Lanes({ at }: { at: number }) {
  const ticks = [130, 210, 290, 370, 450];
  const [a, b] = s09.detail.lanes;
  return (
    <svg className="lanes" viewBox="0 0 600 220" data-at={at} aria-hidden="true">
      <text x="24" y="34" className="ln-label">
        {a}
      </text>
      <text x="24" y="190" className="ln-label">
        {b}
      </text>
      <line x1="24" y1="70" x2="540" y2="70" className="ln a" />
      <path d="M90 58 V50 H500 V58" className="ln bracket" />
      <line x1="24" y1="160" x2="540" y2="160" className={`ln b${at >= 1 ? " on" : ""}`} />
      {ticks.map((x, k) => (
        <g key={x} className={`tie${at >= 2 ? " on" : ""}`} style={{ transitionDelay: `${k * 90}ms` }}>
          <line x1={x} y1="76" x2={x} y2="154" />
          {k === 3 ? <rect x={x - 6} y="109" width="12" height="12" className="diff" /> : <circle cx={x} cy="115" r="3" />}
        </g>
      ))}
      <g className={`decide${at >= 3 ? " on" : ""}`}>
        <path d="M540 70 L572 115 L540 160" className="ln" />
        <circle cx="572" cy="115" r="7" className="approve" />
        <circle cx="572" cy="115" r="16" className="approve-halo" />
      </g>
    </svg>
  );
}

function Parallel({ onClose, at, set }: { onClose: () => void; at: number; set: (n: number) => void }) {
  const d = s09.detail;
  const S = d.steps[at];
  const last = at === d.steps.length - 1;
  return (
    <Layer label={d.label} closeLabel={d.close} onClose={onClose} count={d.steps.length} at={at} set={set}>
      {() => (
        <div className="detail-body parallel">
          <div className="detail-left">
            <p className="display lg">
              {d.head[0]}
              <br />
              {d.head[1]}
              <br />
              <em>{d.head[2]}</em>
            </p>
            <div className="notes">
              <Mark kind="hypothesis">{d.note}</Mark>
            </div>
          </div>
          <div className="detail-right">
            <Lanes at={at} />
            <div className="detail-main step" key={at} aria-live="polite">
              <span className="lbl acc">{S.kicker}</span>
              <strong className="display md">{S.title}</strong>
              <p className="support">{S.detail}</p>
            </div>
            <div className="detail-nav four" role="group" aria-label={d.label}>
              {d.steps.map((x, n) => (
                <button key={x.short} aria-pressed={n === at} onClick={() => set(n)}>
                  {pad2(n + 1)} <span>{x.short}</span>
                </button>
              ))}
            </div>
            <button className="detail-next lbl" onClick={() => set(last ? 0 : at + 1)}>
              {last ? d.again : d.next} <span className="acc">{last ? "↺" : "→"}</span>
            </button>
          </div>
        </div>
      )}
    </Layer>
  );
}

/* ------------------------------------------------------------ slides */

export function S04() {
  const [at, setAt] = useState(0);
  const { overlay } = useDeck();
  return (
    <RunwayScene
      id="s04"
      film="ledger-monolith"
      data={s04}
      descend={overlay === "s04" ? at : 0}
      layer={(close) => <Evidence onClose={close} at={at} set={setAt} />}
    />
  );
}

export function S09() {
  const [at, setAt] = useState(0);
  return <RunwayScene id="s09" film="bring-your-last-close" data={s09} layer={(close) => <Parallel onClose={close} at={at} set={setAt} />} />;
}
