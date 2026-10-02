"use client";

import { useEffect, useRef, type RefObject } from "react";
import { inspector, proof, s02 } from "@/content";
import { STAGE_ROWS, evidenceFor } from "@/components/proof/model";
import { pad2 } from "@/components/ui";
import { COLS, SPECIMEN, towerOf } from "@/components/world/formations";
import { markerEls, useWorld, worldStore } from "@/components/world/store";

/* The 02 explainer. One surface, one hierarchy in both modes:
   1. the stage (or trace step): eyebrow, title, explanation
   2. the details: one two-column list, a label column and a value column
   3. why it matters, set apart
   Outside the trace it follows the slide's active stage (Connect, Reason,
   Prove), the same value that drives the stage controls and the scene. */

function useEvidence() {
  const { entry } = useWorld();
  const e = entry ?? SPECIMEN;
  return { e, ev: evidenceFor(e, inspector, COLS, proof.dayWord) };
}

/* Every detail row, in both modes, comes through this one list. */
function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="pm-rows">
      {rows.map(([k, v]) => (
        <div className="pm-row" key={k}>
          <dt className="lbl">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Why({ text }: { text: string }) {
  return (
    <div className="pm-why">
      <p className="lbl">{proof.benefitLabel}</p>
      <p>{text}</p>
    </div>
  );
}

/* ------------------------------------------------------------ the stage */

function Stage({ stage }: { stage: number }) {
  const { e, ev } = useEvidence();
  const v = proof.views[stage];
  const rows = STAGE_ROWS[stage].map((k): [string, string] => (k < 0 ? [inspector.rows[0], s02.sources[towerOf(e)]] : [proof.steps[k].evidence, ev[k]]));
  return (
    <div className="pm-body fade" key={stage} aria-live="polite">
      <header className="pm-head">
        <p className="lbl pm-eyebrow">
          <span className="acc">{pad2(stage + 1)}</span> {s02.steps[stage].word}
        </p>
        <h3>{v.title}</h3>
        <p className="pm-ex">{v.explanation}</p>
      </header>
      <Rows rows={rows} />
      <Why text={v.benefit} />
    </div>
  );
}

/* ----------------------------------------------------- the trace panel */

function Trace({ firstRef }: { firstRef: RefObject<HTMLButtonElement | null> }) {
  const { step } = useWorld();
  const { ev } = useEvidence();
  const S = proof.steps[step];
  const last = proof.steps.length - 1;
  return (
    <div className="pm-body trace" role="region" aria-label={proof.traceTitle}>
      <header className="pm-head">
        <p className="lbl pm-eyebrow pm-split">
          <span className="acc">{proof.traceTitle}</span>
          <span>
            {proof.stepWord} {pad2(step + 1)} / {pad2(last + 1)}
          </span>
        </p>
        <p className="lbl mute">{proof.instruction}</p>
      </header>
      <ol className="trace-steps">
        {proof.steps.map((x, k) => (
          <li key={x.id}>
            <button
              ref={k === 0 ? firstRef : undefined}
              aria-current={k === step ? "step" : undefined}
              className={k < step ? "done" : ""}
              onClick={() => worldStore.dispatch({ type: "step", step: k })}
            >
              <span className="n">{pad2(k + 1)}</span>
              {x.label}
            </button>
          </li>
        ))}
      </ol>
      <div className="trace-detail fade" key={step} aria-live="polite">
        <h3>{S.title}</h3>
        <p className="pm-ex">{S.explanation}</p>
        <Rows rows={[[S.evidence, ev[step]]]} />
      </div>
      <div className="trace-ctl">
        <button className="lbl" onClick={() => worldStore.dispatch({ type: "back" })} disabled={step === 0}>
          ← {proof.back}
        </button>
        <button className="lbl" onClick={() => worldStore.dispatch({ type: "next" })} disabled={step === last}>
          {proof.next} →
        </button>
        <span className="sp" />
        <button className="lbl exit" onClick={() => worldStore.dispatch({ type: "exit" })}>
          {proof.exit} ×
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------ markers on the layers
   Real buttons. The 3D scene writes their position every frame from the
   layer anchors, so they stay on their layers through resizes and turns. */

function Markers() {
  const { step } = useWorld();
  return (
    <div className="markers" role="group" aria-label={proof.instruction}>
      {proof.steps.map((x, k) => (
        <button
          key={x.id}
          ref={(el) => void (markerEls[k] = el)}
          className={`marker${k === step ? " on" : ""}${k < step ? " done" : ""}`}
          aria-label={`${proof.stepWord} ${k + 1} / ${proof.steps.length}: ${x.label}`}
          aria-pressed={k === step}
          onClick={() => worldStore.dispatch({ type: "step", step: k })}
        >
          <span className="dot" aria-hidden="true">
            {pad2(k + 1)}
          </span>
          <span className="ml">{x.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- explorer */

export function ProofExplorer({ stage, triggerRef }: { stage: number; triggerRef: RefObject<HTMLButtonElement | null> }) {
  const { tracing } = useWorld();
  const first = useRef<HTMLButtonElement | null>(null);
  const was = useRef(false);

  // Opening moves focus to step one; leaving returns it to the trigger.
  useEffect(() => {
    if (tracing && !was.current) first.current?.focus({ preventScroll: true });
    if (!tracing && was.current) triggerRef.current?.focus({ preventScroll: true });
    was.current = tracing;
  }, [tracing, triggerRef]);

  return (
    <>
      <aside className="proof">
        {tracing ? <Trace firstRef={first} /> : <Stage stage={stage} />}
        <p className="mk illustrative pm-tag">{proof.tag}</p>
      </aside>
      {tracing && <Markers />}
    </>
  );
}
