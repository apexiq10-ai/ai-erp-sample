"use client";

import type { ReactNode } from "react";
import { a1, a2, a3, a4, a5, a6, a7, appendixList, apxLabels as L, s07 } from "@/content";
import { Frame, Mark, useDeck, useSection } from "@/components/ui";

/* The appendix: seven exhibits on warm paper, one screen that behaves like a
   deck. A bar across the top moves one page at a time. */

type Apx = { title: string; headline: string; narrative: string[]; exhibit: string; implication: string };

function Page({ id, a, children, aside }: { id: string; a: Apx; children: ReactNode; aside?: ReactNode }) {
  return (
    <article className={`apx-page ${id}`} key={id}>
      <h2 className="display lg">{a.headline}</h2>
      <div className="apx-body">
        <div className="apx-prose">
          {a.narrative.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          {aside}
        </div>
        <figure>
          <figcaption className="lbl">
            <span>
              {L.exhibit} · {id.toUpperCase()}
            </span>
            <span className="mute">{a.exhibit}</span>
          </figcaption>
          {children}
        </figure>
      </div>
      <p className="apx-impl">
        <span className="lbl acc">→</span> {a.implication}
      </p>
    </article>
  );
}

const cell = (v: string) => {
  if (v === "Claimed") return <Mark kind="claimed">{v}</Mark>;
  if (v === "Not verified") return <Mark kind="illustrative">{v}</Mark>;
  return <span>{v}</span>;
};

function A1() {
  return (
    <Page id="a1" a={a1} aside={<p className="lbl mute src">{a1.source}</p>}>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              {a1.cols.map((c, k) => (
                <th key={c} className={k === 4 ? "us" : ""}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {a1.rows.map((r) => (
              <tr key={r.cap}>
                <th>{r.cap}</th>
                {r.v.map((v, k) => (
                  <td key={k} className={k === 3 ? "us" : ""}>
                    {cell(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="legend">
        <Mark kind="claimed">{a1.legend[0]}</Mark>
        <Mark kind="illustrative">{a1.legend[1]}</Mark>
      </div>
    </Page>
  );
}

function A2() {
  return (
    <Page
      id="a2"
      a={a2}
      aside={
        <div className="path">
          <p className="lbl">{a2.pathLabel}</p>
          <ol>
            {a2.path.map((p, k) => (
              <li key={p} className={k === 0 ? "on" : ""}>
                {p}
              </li>
            ))}
          </ol>
        </div>
      }
    >
      <table className="tbl">
        <thead>
          <tr>
            <th />
            <th>{L.expansion}</th>
            <th>{L.ease}</th>
          </tr>
        </thead>
        <tbody>
          {a2.workflows.map((w) => (
            <tr key={w.name} className={w.wedge ? "us-row" : ""}>
              <th>{w.name}</th>
              <td>{w.expand}</td>
              <td>{w.ease}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ol className="crit">
        {a2.criteria.map((c) => (
          <li key={c.name}>
            <span className="lbl">{c.name}</span>
            <span>{c.why}</span>
          </li>
        ))}
      </ol>
      <table className="tbl small">
        <tbody>
          {a2.segments.map((s) => (
            <tr key={s.order}>
              <th className="lbl">{s.order}</th>
              <td>{s.seg}</td>
              <td className="mute">{s.why}</td>
              <td>{s.proof === "Hypothesis" ? <Mark kind="hypothesis">{s.proof}</Mark> : s.proof}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}

function A3() {
  return (
    <Page id="a3" a={a3}>
      <div className="sides">
        {[a3.demand, a3.permit].map((list, k) => (
          <div key={k}>
            <p className="lbl">{a3.sides[k]}</p>
            <ul>
              {list.map((x) => (
                <li key={x.role}>
                  <strong>{x.role}</strong>
                  <span>{x.value}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="converge">
        <span className="dot" aria-hidden="true" />
        {a3.converge}
      </p>
    </Page>
  );
}

function A4() {
  return (
    <Page id="a4" a={a4} aside={<Mark kind="hypothesis">{a4.hypothesis}</Mark>}>
      <div className="flows">
        <ol className="flow slow">
          {a4.today.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
        <ol className="flow fast">
          {a4.parallel.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
      </div>
      <div className="grid4">
        {a4.metrics.map((m) => (
          <div key={m.name}>
            <p className="lbl">{m.name}</p>
            <ul>
              {m.items.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="scale">
        <span className="lbl">{a4.scaleLabel}</span> {a4.scale.join(" · ")}
      </p>
    </Page>
  );
}

function A5() {
  return (
    <Page
      id="a5"
      a={a5}
      aside={
        <p className="rule">
          <span className="lbl">{a5.ruleLabel}</span>
          {a5.rule}
        </p>
      }
    >
      <ol className="timeline">
        {a5.timeline.map((t) => (
          <li key={t.when}>
            <span className="lbl">{t.when}</span>
            <span>{t.what}</span>
          </li>
        ))}
      </ol>
      <table className="tbl small">
        <tbody>
          {a5.assets.map((x, k) => (
            <tr key={x.stage}>
              <th className="lbl">{x.stage}</th>
              <td>{x.asset}</td>
              <td className="mute">{x.signal}</td>
              <td className="mute">
                {s07.stages[k].plays
                  .filter((p) => p[2] !== "open") // an open slot is not a play
                  .map((p) => p[0])
                  .join(" · ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}

function A6() {
  return (
    <Page
      id="a6"
      a={a6}
      aside={
        <div className="never">
          <p className="lbl">{a6.neverLabel}</p>
          <ul>
            {a6.never.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      }
    >
      <div className="grid4">
        {a6.gates.map((g) => (
          <div key={g.name}>
            <p className="lbl">{g.name}</p>
            <ul>
              {g.items.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="principle">
        <strong>{a6.principle}</strong> <span className="mute">{a6.not}</span>
      </p>
    </Page>
  );
}

/* A7 · PMM loops. The technical page: three loops on one event stream, and
   the reactivation loop specified down to its trigger events. */
function A7() {
  return (
    <Page
      id="a7"
      a={a7}
      aside={
        <>
          <div className="plumbing">
            <p className="lbl">{a7.plumbingLabel}</p>
            <ol>
              {a7.plumbing.map((x, k) => (
                <li key={x}>
                  <span className="lbl">{String(k + 1).padStart(2, "0")}</span>
                  <span>{x}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="never guard">
            <p className="lbl">{a7.guardrailsLabel}</p>
            <ul>
              {a7.guardrails.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <Mark kind="hypothesis">{a7.hypothesis}</Mark>
        </>
      }
    >
      <div className="tbl-wrap">
        <table className="tbl small loops">
          <thead>
            <tr>
              {a7.loopCols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {a7.loops.map((l) => (
              <tr key={l.name} className={l.name === a7.loops[2].name ? "us-row" : ""}>
                <th>{l.name}</th>
                <td>{l.reads}</td>
                <td>{l.decides}</td>
                <td>{l.does}</td>
                <td className="mute">{l.owner}</td>
                <td className="mute">{l.cadence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="react">
        <p className="lbl">{a7.reactivationLabel}</p>
        <ol className="flow fast loop-steps">
          {a7.steps.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
      </div>
      <div className="tbl-wrap">
        <table className="tbl small triggers">
          <thead>
            <tr>
              {a7.triggerCols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {a7.triggers.map((t) => (
              <tr key={t.missing}>
                <th>{t.stalled}</th>
                <td>
                  <code>{t.missing}</code>
                </td>
                <td className="mute">{t.after}</td>
                <td>{t.reason}</td>
                <td>{t.play}</td>
                <td>
                  <code>{t.success}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="legend">
        <Mark kind="illustrative">{a7.eventsNote}</Mark>
      </div>
    </Page>
  );
}

const PAGES = [A1, A2, A3, A4, A5, A6, A7];

export function Appendix() {
  const { step } = useSection();
  const { setStep } = useDeck();
  const P = PAGES[step];
  const meta = appendixList[step];
  return (
    <Frame className="apx">
      <nav className="apx-bar" aria-label="Appendix">
        <button className="lbl" disabled={step === 0} onClick={() => setStep("apx", step - 1)}>
          ← <span className="hide-sm">{L.prev}</span>
        </button>
        <p className="lbl">
          <span className="acc">
            {meta.index} / A{PAGES.length}
          </span>{" "}
          · {meta.title}
        </p>
        <div className="apx-ticks" role="group" aria-label="Exhibits">
          {appendixList.map((a, k) => (
            <button key={a.id} aria-label={`${a.index} ${a.title}`} aria-current={k === step} onClick={() => setStep("apx", k)} />
          ))}
        </div>
        <button className="lbl" disabled={step === PAGES.length - 1} onClick={() => setStep("apx", step + 1)}>
          <span className="hide-sm">{L.next}</span> →
        </button>
      </nav>
      <P />
    </Frame>
  );
}
