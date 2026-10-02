"use client";

import { createContext, useContext, useEffect, useRef, type ComponentType, type CSSProperties, type ElementType, type ReactNode } from "react";
import type { Mode } from "@/content";

/* ------------------------------------------------------------ contexts */

export type SectionState = {
  i: number;
  id: string;
  part: "main" | "appendix";
  label: string;
  step: number;
  mode: Mode;
  active: boolean; // this section holds the viewport
  onScreen: boolean; // any part of this section is in the viewport
  reading: boolean; // scroll-driven (microsite) rather than key-driven (presentation)
  reduced: boolean; // prefers-reduced-motion
  motion: boolean; // footage and 3D may move (motion toggle on, not reduced)
  arrival: number; // increments each time the presenter lands here
  register: (el: HTMLElement | null) => void;
};

export const SectionContext = createContext<SectionState | null>(null);

export type DeckApi = {
  goToId: (id: string) => void;
  advance: (d: 1 | -1) => void;
  // Set a build directly. On a scrubbed section this also scrolls to the
  // build, unless the call comes from the scroll itself ({ scroll: false }).
  setStep: (id: string, step: number, opts?: { scroll?: boolean }) => void;
  // A full-screen detail layer (04 evidence, 09 Parallel Close). While one is
  // open the deck yields the arrow keys to it and Escape closes it.
  overlay: string | null;
  setOverlay: (id: string | null) => void;
};
export const DeckContext = createContext<DeckApi>({
  goToId: () => {},
  advance: () => {},
  setStep: () => {},
  overlay: null,
  setOverlay: () => {},
});

export function useSection(): SectionState {
  const c = useContext(SectionContext);
  if (!c) throw new Error("useSection outside a section");
  return c;
}
export const useDeck = () => useContext(DeckContext);

/* -------------------------------------------------------------- frame */

export function Frame({
  className = "",
  children,
  media,
  after,
  scrub,
}: {
  className?: string;
  children: ReactNode;
  media?: ReactNode;
  after?: ReactNode;
  // A scrubbed section is `scrub` viewports tall; its frame stays pinned
  // while the page scrolls, and each viewport of scroll is one build.
  scrub?: number;
}) {
  const s = useSection();
  const body = (
    <div className="wrap">
      <div className="frame">{children}</div>
    </div>
  );
  return (
    <section
      id={s.id}
      ref={s.register}
      className={`sec ${s.part} ${scrub ? "scrub" : ""} ${className}`}
      style={scrub ? ({ "--scrub": scrub } as CSSProperties) : undefined}
      data-mode={s.mode}
      data-at={s.step}
      data-active={s.active || undefined}
      aria-label={s.label}
    >
      {media}
      {scrub ? <div className="pin">{body}</div> : body}
      {after}
    </section>
  );
}

/* -------------------------------------------------------------- build
   A build lands when the section's step reaches n. Space is reserved, so
   layouts never jump; it rises in with a short mask. */

type BProps = {
  n: number;
  v?: "rise" | "wipe" | "cut";
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [k: string]: unknown;
};

export function B({ n, v = "rise", as = "div", className = "", children, ...rest }: BProps) {
  const { step } = useSection();
  const on = step >= n;
  const Tag = as as ComponentType<Record<string, unknown>>;
  return (
    <Tag className={`b ${on ? "on" : "off"} ${className}`} data-v={v} aria-hidden={on ? undefined : true} {...rest}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------ evidence marks
   Claimed: hollow square. Illustrative: dashed. Hypothesis: dashed bar.
   Inference: solid. */

export function Mark({ kind, children }: { kind: "claimed" | "illustrative" | "hypothesis" | "inference"; children: ReactNode }) {
  return <span className={`mk ${kind}`}>{children}</span>;
}

export function Ref({ to, children, className = "" }: { to: string; children: ReactNode; className?: string }) {
  const { goToId } = useDeck();
  return (
    <a
      href={`#${to}`}
      className={`ref ${className}`}
      onClick={(e) => {
        e.preventDefault();
        goToId(to);
      }}
    >
      {children}
    </a>
  );
}

/* --------------------------------------------------------------- film
   Runway footage. Muted, looping, inline, no chrome. It plays only while
   its section is on screen and motion is on; otherwise it holds still. If
   the file fails or motion is off from the start, the poster still keeps
   the composition. */

export function Film({ name, play, className = "", style }: { name: string; play: boolean; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    if (!play) {
      v.pause();
      return;
    }
    const start = () => {
      if (document.hidden || (!v.paused && !v.ended)) return;
      const p = v.play();
      if (p) p.catch(() => {});
    };
    const onVis = () => (document.hidden ? v.pause() : start());
    start();
    v.addEventListener("canplay", start);
    document.addEventListener("visibilitychange", onVis);
    const watchdog = window.setInterval(start, 1500);
    return () => {
      window.clearInterval(watchdog);
      v.removeEventListener("canplay", start);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [play]);
  return (
    <div className={`film-wrap ${className}`} style={style} aria-hidden="true">
      <div className="film-still" style={{ backgroundImage: `url(/media/${name}-poster.jpg)` }} />
      <video
        ref={ref}
        className="film"
        src={`/media/${name}.mp4`}
        poster={`/media/${name}-poster.jpg`}
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        tabIndex={-1}
        onError={(e) => ((e.currentTarget as HTMLVideoElement).style.visibility = "hidden")}
      />
    </div>
  );
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
