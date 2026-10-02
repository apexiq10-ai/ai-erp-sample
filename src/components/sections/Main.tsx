"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { a5, appendixList, proof, s01, s02, s03, s05, s06, s07, s08, sections } from "@/content";
import { B, Frame, Mark, Ref, pad2, useDeck, useSection } from "@/components/ui";
import { StageArt, type ArtKind } from "@/components/sections/Vignettes";
import { hotspotEls, journeyStage, openEls, openTarget, openTouched, stackHover, useJourney, useStackHover, useWorld, worldStore } from "@/components/world/store";
import { STACK_LAYERS, layerOfStep, openStepFor, stepOfLayer } from "@/components/world/interaction";
import { ProofExplorer } from "@/components/sections/Proof";

const TOTAL = pad2(sections.filter((s) => s.part === "main").length);

/* Evidence footers link straight into the appendix exhibit. */
function ApxRef({ n }: { n: number }) {
  const a = appendixList[n - 1];
  return (
    <Ref to={a.id}>
      {a.index} · {a.title} →
    </Ref>
  );
}

/* Shared editorial top line: number, total, subject. */
function Topline({ extra }: { extra?: string }) {
  const { i } = useSection();
  const meta = sections[i];
  return (
    <div className="topline lbl">
      <span className="acc">
        {meta.index} / {TOTAL}
      </span>
      <span>{extra ?? meta.subject}</span>
    </div>
  );
}

/* 01 · HINDSIGHT --------------------------------------------------------
   The month streams past in 3D. Moving across the frame closes it: the
   same entries leave the stream and pile into the month-end ridge, and the
   hindsight line wipes in with them. The 3D render loop writes the rendered
   progress to --p01 on this section, so the type and the scene move as one
   without re-rendering React. The slider is the keyboard and assistive
   equivalent; the deck's arrows close and reopen the month too. */
export function S01() {
  const { step, motion } = useSection();
  const { setStep } = useDeck();
  const slider = useRef<HTMLInputElement>(null);
  const touched = useSyncExternalStore(openTouched.sub, openTouched.get, () => false);
  const [touch, setTouch] = useState(false);
  const stepNow = useRef(step);
  stepNow.current = step;

  useEffect(() => {
    openEls.section = document.getElementById("s01");
    openEls.slider = slider.current;
    setTouch(window.matchMedia("(hover: none)").matches);
    // keep the slider on the target when the pointer or the keys move it
    const sync = () => {
      const el = slider.current;
      if (el && document.activeElement !== el) el.value = String(Math.round(openTarget.get() * 1000));
    };
    sync();
    const off = openTarget.sub(sync);
    return () => {
      off();
      openEls.section = null;
      openEls.slider = null;
    };
  }, []);

  const onInput = (v: number) => {
    openTarget.set(v);
    openTouched.set(true);
    const s = openStepFor(v, stepNow.current);
    if (s !== stepNow.current) setStep("s01", s);
  };

  return (
    <Frame className={`s01 w3d${motion ? "" : " still"}`}>
      <Topline />
      <div className="s01-lines">
        <h1 className="display xl">
          {s01.line1[0]}
          <br />
          {s01.line1[1]}
        </h1>
        <p className="display s01-sub">
          {s01.line2[0]}
          <br />
          <em>{s01.line2[1]}</em>
        </p>
      </div>
      <div className="s01-foot">
        <label className="month">
          <span className="lbl end">{s01.ends[0]}</span>
          <span className="track">
            <span className="fill" aria-hidden="true" />
            <span className="thumb" aria-hidden="true" />
            <input
              ref={slider}
              type="range"
              min={0}
              max={1000}
              step={10}
              defaultValue={0}
              aria-label={s01.slider}
              aria-valuetext={`${s01.slider}: ${step ? s01.ends[1] : s01.ends[0]}`}
              onInput={(e) => onInput(Number((e.target as HTMLInputElement).value) / 1000)}
            />
          </span>
          <span className="lbl end">{s01.ends[1]}</span>
        </label>
        <p className="support s01-kicker">{s01.kicker}</p>
        <span className={`lbl gesture${touched ? " gone" : ""}`} aria-hidden={touched || undefined}>
          {touch ? s01.gesture.touch : s01.gesture.pointer}
        </span>
      </div>
    </Frame>
  );
}

/* 02 · MEET RILLET -------------------------------------------------------
   Three viewports of scroll, one pinned frame. One active stage (the deck's
   build for 02) drives the stage label, its caption and the 3D scene; the
   viewport under the centre line sets it while scrolling, keys and clicks
   set it (and scroll to it) when presenting. The right-hand explorer and
   the trace share one proof model (Proof.tsx). */
const [T0, T1] = s02.title;
const TITLE = { a: T0.slice(0, T0.lastIndexOf(" ")), b: T0.slice(T0.lastIndexOf(" ") + 1), c: T1.slice(0, T1.indexOf(" ")), d: T1.slice(T1.indexOf(" ") + 1) };

export function S02() {
  const { step, motion } = useSection();
  const { setStep } = useDeck();
  const { tracing } = useWorld();
  const trigger = useRef<HTMLButtonElement>(null);
  const zones = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setStep("s02", Number((e.target as HTMLElement).dataset.stage), { scroll: false });
      },
      { rootMargin: "-49.5% 0px -49.5% 0px", threshold: 0 },
    );
    zones.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [setStep]);

  const st = s02.steps[step];
  return (
    <Frame
      className={`s02 w3d${tracing ? " tracing" : ""}`}
      scrub={s02.steps.length}
      after={
        <div className="stage-zones" aria-hidden="true">
          {s02.steps.map((v, k) => (
            <div key={v.word} data-stage={k} ref={(el) => void (zones.current[k] = el)} />
          ))}
        </div>
      }
    >
      <div className="s02-left">
        <Topline />
        <p className="meet lbl">{s02.meet}</p>
        <h2 className="display s02-title">
          {TITLE.a}
          <br className="br-m" /> {TITLE.b}
          <br className="br-d" />{" "}
          <em>
            {TITLE.c}
            <br className="br-m" /> {TITLE.d}
          </em>
        </h2>
        <p className="support">{s02.sub}</p>
        <div className="stages">
          <div className="stage-row" role="group" aria-label={s02.stagesLabel}>
            {s02.steps.map((v, k) => (
              <button key={v.word} aria-pressed={k === step} className={k === step ? "on" : k < step ? "past" : ""} onClick={() => setStep("s02", k)}>
                <span className="n">{pad2(k + 1)}</span>
                <span className="word">{v.word}</span>
              </button>
            ))}
          </div>
          {/* reduced motion or motion off: the whole sequence, readable at once */}
          {!motion ? (
            <ol className="stage-static">
              {s02.steps.map((v) => (
                <li key={v.word}>
                  <strong>{v.word}.</strong> {v.caption} <span className="mute">{v.line}</span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="stage-caption" aria-live="polite">
              <div className="fade" key={step}>
                <p className="cap">{st.caption}</p>
                <p className="line">
                  {st.line}
                  {step === 1 && <span className="lbl mute annot"> {s02.annotation}</span>}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="s02-foot">
          <button ref={trigger} className="explore" aria-pressed={tracing} onClick={() => worldStore.dispatch({ type: "open" })}>
            <span className="plus" aria-hidden="true">
              +
            </span>
            <span className="lbl">{s02.trace}</span>
          </button>
          <span className="lbl mute hint">{s02.hint}</span>
          <ApxRef n={1} />
        </div>
      </div>
      <ProofExplorer stage={step} triggerRef={trigger} />
    </Frame>
  );
}

/* 03 · THE WEDGE ---------------------------------------------------------
   The stack is the interface: five layers of one entry, standing on the
   ledger. The selected layer is the deck's build for 03 (0 = overview), so
   a click on a layer in 3D, its hotspot, its row in the list, the arrow
   keys and Escape all set the same number. Hover and focus share one store,
   so the mesh, the hotspot and the row light together. */
const TAKEN = s03.today.tasks.map((t) => s03.layers.findIndex((l) => l.takes.includes(t)));
const SIGNED = s03.layers.findIndex((l) => l.takes.includes(s03.today.decision));

function Hotspots({ sel }: { sel: number }) {
  const { setStep } = useDeck();
  const hover = useStackHover();
  return (
    <div className="hotspots" aria-hidden="true">
      {proof.steps.slice(0, STACK_LAYERS).map((x, k) => (
        <button
          key={x.id}
          tabIndex={-1}
          ref={(el) => void (hotspotEls[k] = el)}
          className={`hotspot${sel === k ? " on" : ""}${hover === k ? " hover" : ""}`}
          data-vis="off"
          onClick={() => setStep("s03", stepOfLayer(k))}
          onPointerEnter={() => stackHover.set(k)}
          onPointerLeave={() => stackHover.set(-1)}
        >
          <span className="dot">{pad2(k + 1)}</span>
          <span className="ml">{x.label}</span>
        </button>
      ))}
    </div>
  );
}

export function S03() {
  const { step } = useSection();
  const { setStep } = useDeck();
  const hover = useStackHover();
  const sel = layerOfStep(step);
  const P = sel >= 0 ? proof.steps[sel] : null;
  const L = sel >= 0 ? s03.layers[sel] : null;
  return (
    <Frame className={`s03 w3d${sel >= 0 ? " picked" : ""}`}>
      <Topline extra={s03.eyebrow} />
      <div className="s03-head">
        <h2 className="display lg">{s03.title}</h2>
        <p className="display sm mute">
          {s03.build[0]} <em className="hi">{s03.build[1]}</em>
        </p>
      </div>

      <div className="s03-body">
        <div className="layers">
          <p className="lbl acc">{s03.stackLabel}</p>
          <ol className="layer-list" aria-label={s03.stackLabel}>
            {proof.steps.slice(0, STACK_LAYERS).map((x, k) => (
              <li key={x.id}>
                <button
                  aria-pressed={sel === k}
                  className={`${hover === k ? "hover" : ""}${sel > k ? " past" : ""}`}
                  onClick={() => setStep("s03", stepOfLayer(k))}
                  onPointerEnter={() => stackHover.set(k)}
                  onPointerLeave={() => stackHover.set(-1)}
                  onFocus={() => stackHover.set(k)}
                  onBlur={() => stackHover.set(-1)}
                >
                  <span className="n">{pad2(k + 1)}</span>
                  <span className="nm">{x.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="layer-card" aria-live="polite">
          {P && L ? (
            <div className="fade" key={P.id}>
              <p className="lbl acc">
                {pad2(sel + 1)} / {pad2(STACK_LAYERS)} · {P.label}
              </p>
              <h3 className="display md">{P.title}</h3>
              <dl className="facts">
                <dt className="lbl">{s03.facts[0]}</dt>
                <dd>{P.explanation}</dd>
                <dt className="lbl">{s03.facts[1]}</dt>
                <dd>{L.happened}</dd>
                <dt className="lbl">{s03.facts[2]}</dt>
                <dd>{L.why}</dd>
              </dl>
              <div className="card-nav">
                <button className="lbl" onClick={() => setStep("s03", 0)}>
                  ← {s03.overview}
                </button>
                {sel < STACK_LAYERS - 1 && (
                  <button className="lbl" onClick={() => setStep("s03", stepOfLayer(sel + 1))}>
                    {s03.nextLayer} →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="fade" key="overview">
              <p className="lbl acc">{s03.event.name}</p>
              <h3 className="display md">{s03.event.lines[0]}</h3>
              <p className="support small">{s03.event.lines[1]}</p>
              <p className="lbl mute instruction">{s03.instruction}</p>
            </div>
          )}
        </div>
      </div>

      <div className="today">
        <span className="lbl mute">{s03.today.label}</span>
        <ol>
          {s03.today.tasks.map((t, k) => (
            <li key={t} className={TAKEN[k] >= 0 && sel >= TAKEN[k] ? "taken" : ""}>
              {t}
            </li>
          ))}
          <li className={`decision${sel >= SIGNED ? " signed" : ""}`}>→ {s03.today.decision}</li>
        </ol>
        <span className="sp" />
        <Mark kind="inference">{s03.tags[0]}</Mark>
        <Mark kind="claimed">{s03.tags[1]}</Mark>
      </div>
      <Hotspots sel={sel} />
    </Frame>
  );
}

/* 05 · BUYERS ------------------------------------------------------------
   Four rows. Each build (or a click) opens one buyer's map while the camera
   moves to that buyer's view of the same ledger. */
export function S05() {
  const { step } = useSection();
  const { setStep } = useDeck();
  const open = step >= 1 && step <= 4 ? step - 1 : -1;
  return (
    <Frame className="s05 w3d">
      <Topline />
      <h2 className="display lg">
        {s05.title[0]}
        <br />
        <em>{s05.title[1]}</em>
      </h2>
      <ol className="buyers">
        {s05.roles.map((r, k) => {
          const on = open === k;
          return (
            <li key={r.role} className={on ? "open" : open >= 0 ? "dim" : ""}>
              <button className="buyer" aria-expanded={on} onClick={() => setStep("s05", on ? 5 : k + 1)}>
                <span className="lbl acc">{pad2(k + 1)}</span>
                <span className="lbl role">{r.role}</span>
                <span className="quote">“{r.quote}”</span>
              </button>
              {on && (
                /* one grid with the row above: labels under the role, points under the quote */
                <div className="map">
                  <p className="lbl mute map-k">{s05.labels[0]}</p>
                  <div className="map-v">
                    <p className="who">{r.buys}</p>
                    <p className="lbl mute stakes">{r.stakes}</p>
                  </div>
                  {([r.hard, r.trigger, r.say] as string[][]).map((list, n) => (
                    <Fragment key={n}>
                      <p className="lbl mute map-k">{s05.labels[n + 1]}</p>
                      <ul className="map-v">
                        {list.map((x, m) => (
                          <li key={x}>
                            {x}
                            {n === 2 && "claimedSay" in r && r.claimedSay === m && (
                              <>
                                {" "}
                                <Mark kind="claimed">{s05.claimed}</Mark>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </Fragment>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="s05-foot">
        <B n={5} as="p" className="display sm">
          {s05.footer}
        </B>
        <span className="sp" />
        <Mark kind="hypothesis">{s05.tag}</Mark>
        <ApxRef n={3} />
      </div>
    </Frame>
  );
}

/* 06 · SEQUENCE ----------------------------------------------------------
   The phases sit right under the headline. Selecting one (a press or a
   click) lights its platform in the world and plays its own code-built
   animation (Vignettes.tsx); every other phase rests on its finished frame. */
export function S06() {
  const { step, onScreen, motion } = useSection();
  const { setStep } = useDeck();
  const cur = s06.phases[step - 1];
  return (
    <Frame className="s06 w3d">
      <Topline />
      <div className="s06-head">
        <h2 className="display lg">
          {s06.title[0]}
          <br />
          <em>{s06.title[1]}</em>
        </h2>
        <B n={4} as="p" className="display sm s06-bottom">
          {s06.bottom[0]}
          <br />
          {s06.bottom[1]}
        </B>
      </div>
      <ol className="phases">
        {s06.phases.map((p, k) => {
          const now = step === k + 1;
          return (
            <li key={p.name} className={step >= k + 1 ? (now ? "on cur" : "on") : ""}>
              <button className="phase-btn" onClick={() => setStep("s06", k + 1)} aria-pressed={now}>
                <StageArt kind={p.art as ArtKind} active={now} visible={onScreen} motion={motion} />
                <span className="ph-name">
                  <span className="lbl acc">{p.n}</span>
                  <strong className="display sm">{p.name}</strong>
                  {now && motion && <span className="lbl now">● {s06.now}</span>}
                </span>
              </button>
              <p className={`beat${now || !motion ? " shown" : ""}`}>{p.beat}</p>
              <p className="line">{p.line}</p>
              <ul className="items">
                {p.items.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {cur ? `${cur.name}: ${cur.beat}` : ""}
      </p>
      <div className="s06-foot">
        <ApxRef n={4} />
        <ApxRef n={6} />
      </div>
    </Frame>
  );
}

/* 07 · CHANNELS ----------------------------------------------------------
   Two selections, each with one owner. The phase (Foundational, Advancing,
   Mature) is the deck's build for 07. The buying-journey stage is
   `journeyStage`: the rail, the detail area and the scene (column highlight,
   floor arc, play labels) all read it. Plays live is counted from the stage
   data, and an open slot is never counted. */
const SLOTS = s07.stages.reduce((n, st) => n + st.plays.length, 0);
const liveAt = (phase: number) => s07.stages.reduce((n, st) => n + st.plays.filter(([, p, f]) => f !== "open" && p <= phase).length, 0);
const openAt = (phase: number) => s07.stages.reduce((n, st) => n + st.plays.filter(([, p, f]) => f === "open" && p <= phase).length, 0);
const OPEN_NAME = s07.stages.flatMap((st) => st.plays).find(([, , f]) => f === "open")?.[0] ?? "";

function Journey({ phase }: { phase: number }) {
  const js = useJourney();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const st = s07.stages[js];
  const last = s07.stages.length - 1;
  const next = js < last ? s07.stages[js + 1].name : s07.nextWorkflow;
  const select = (k: number, focus = false) => {
    journeyStage.set(k);
    if (focus) tabs.current[k]?.focus();
  };
  const onKey = (e: React.KeyboardEvent) => {
    const to = e.key === "ArrowRight" || e.key === "ArrowDown" ? Math.min(last, js + 1) : e.key === "ArrowLeft" || e.key === "ArrowUp" ? Math.max(0, js - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
    if (to < 0) return;
    e.preventDefault();
    select(to, true);
  };
  return (
    <div className="journey2">
      <div className="rail" role="tablist" aria-label={s07.journeyLabel} onKeyDown={onKey} style={{ "--js": js } as React.CSSProperties}>
        <span className="rail-fill" aria-hidden="true" />
        {s07.stages.map((x, k) => (
          <button
            key={x.name}
            ref={(el) => void (tabs.current[k] = el)}
            role="tab"
            id={`jstage-${k}`}
            aria-selected={k === js}
            aria-controls="jstage-panel"
            tabIndex={k === js ? 0 : -1}
            className={k < js ? "past" : ""}
            onClick={() => select(k)}
          >
            <span className="dot" aria-hidden="true" />
            <span className="n">{pad2(k + 1)}</span>
            <span className="nm">{x.name}</span>
          </button>
        ))}
      </div>
      <div className="jdetail" role="tabpanel" id="jstage-panel" aria-labelledby={`jstage-${js}`} aria-live="polite">
        <div className="jd fade" key={`job${js}`}>
          <p className="lbl mute">{s07.detail[0]}</p>
          <p className="jd-main">{st.job}</p>
        </div>
        <div className="jd fade" key={`plays${js}${phase}`}>
          <p className="lbl mute">{s07.detail[1]}</p>
          <ul className="jd-plays">
            {st.plays.map(([name, p, flag]) => {
              const open = flag === "open";
              const live = !open && p <= phase;
              return (
                <li key={name} className={open ? "is-open" : live ? "is-live" : "is-later"}>
                  <span className="nm">{name}</span>
                  <span className="lbl st">{open ? s07.openNote : live ? s07.live : `${s07.from} ${s07.phases[p - 1].name}`}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="jd fade" key={`next${js}`}>
          <p className="lbl mute">{s07.detail[2]}</p>
          <p className="jd-main">
            {a5.assets[js].signal} <span className="acc">→</span> {next}
          </p>
        </div>
      </div>
    </div>
  );
}

export function S07() {
  const { step } = useSection();
  const { setStep } = useDeck();
  const phase = Math.max(1, step);
  const ph = s07.phases[phase - 1];
  const open = openAt(phase);
  return (
    <Frame className="s07 w3d">
      <Topline />
      <div className="s07-head">
        <h2 className="display lg">
          {s07.title[0]}
          <br />
          <em>{s07.title[1]}</em>
        </h2>
        <p className="support">{s07.rule}</p>
      </div>

      <B n={1} className="phase">
        <p className="lbl mute">{s07.navLabel}</p>
        <div className="phase-nav" role="group" aria-label={s07.navLabel}>
          {s07.phases.map((p, k) => (
            <button key={p.name} aria-pressed={step === k + 1} onClick={() => setStep("s07", k + 1)}>
              <span className="lbl">{p.horizon}</span>
              <strong>{p.name}</strong>
            </button>
          ))}
        </div>
        <p className="display sm">{ph.head}</p>
        <p className="support small">{ph.body}</p>
        <p className="lbl">
          {s07.liveLabel}{" "}
          <span className="acc">
            {pad2(liveAt(phase))} / {SLOTS}
          </span>
          {open > 0 && (
            <span className="mute">
              {" "}
              · {open} {OPEN_NAME.toLowerCase()}
            </span>
          )}
        </p>
      </B>

      <B n={1} className="journey-wrap">
        <Journey phase={phase} />
      </B>
      <div className="s07-foot">
        <p className="lbl">{s07.sub}</p>
        <span className="sp" />
        <ApxRef n={5} />
      </div>
    </Frame>
  );
}

/* 08 · MEASUREMENT ------------------------------------------------------- */
export function S08() {
  const { step } = useSection();
  const { setStep } = useDeck();
  const sel = step - 2;
  return (
    <Frame className="s08 w3d">
      <Topline />
      <div className="s08-head">
        <h2 className="display lg">
          {s08.title[0]}
          <br />
          {s08.title[1]}
        </h2>
        <B n={1} as="p" className="display lg">
          <em>{s08.title2}</em>
        </B>
        <B n={1} as="p" className={`s08-scene${sel >= 0 ? " on" : ""}`} aria-live="polite">
          <span className="fade" key={step}>
            {sel >= 0 ? (
              <>
                <span className="lbl acc">{s08.channels[sel].name}</span> {s08.scenes[sel]}
              </>
            ) : (
              <span className="lbl mute">{s08.pick}</span>
            )}
          </span>
        </B>
      </div>
      <B n={1} as="ol" className="channels">
        {s08.channels.map((c, k) => (
          <li key={c.name} className={sel === k ? "on" : ""}>
            <button aria-pressed={sel === k} onClick={() => setStep("s08", k + 2)}>
              <span className="lbl acc">{pad2(k + 1)}</span>
              <strong className="display sm">{c.name}</strong>
              <span className="q">{c.q}</span>
            </button>
            <ul>
              {c.items.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </li>
        ))}
      </B>
      <div className="s08-foot">
        <B n={1} as="p" className="lbl">
          <span className="acc">●</span> {s08.north}
        </B>
        <B n={1} as="p" className="bottomline">
          {s08.bottom[0]} <strong>{s08.bottom[1]}</strong>
        </B>
      </div>
    </Frame>
  );
}
