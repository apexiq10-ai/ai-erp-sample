"use client";

/* 06 · one code-built animation per phase, in the ledger's own materials:
   graphite tiles, silver light, violet only where a person approves.
   No film footage is reused here; the Runway films belong to 04 and 09.

   Each runs only while its phase is selected, on screen and motion is on.
   Otherwise it rests on its base frame, which is the finished state:
   piles collected, ledgers tied out, tower standing, every entity running.
   Reduced motion shows that same frame. */

import type { CSSProperties, ReactNode } from "react";

const d = (s: number) => ({ animationDelay: `${s}s` }) as CSSProperties;
const v = (vars: Record<string, string | number>) => vars as CSSProperties;

/* Harvest: loose evidence drifts in and settles into ordered piles. */
function Harvest() {
  const tiles: ReactNode[] = [];
  for (let p = 0; p < 5; p++)
    for (let l = 0; l < 4; l++) {
      const k = p * 4 + l;
      const dx = ((k * 53) % 90) - 45;
      const dy = -30 - ((k * 37) % 40);
      const r = ((k * 29) % 50) - 25;
      tiles.push(<rect key={k} className="vg-tile vg-collect" x={28 + p * 56} y={88 - l * 11} width={40} height={8} rx={1} style={{ ...v({ "--dx": `${dx}px`, "--dy": `${dy}px`, "--r": `${r}deg` }), ...d(k * 0.11) }} />);
    }
  return (
    <>
      <line className="vg-floor" x1={16} y1={98} x2={304} y2={98} />
      {tiles}
    </>
  );
}

/* Prove: the signed close and the replay, tied out row by row; the
   controller's approval closes it. */
function Prove() {
  const rows: ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const y = 18 + i * 14;
    rows.push(
      <g key={i} className="vg-row" style={d(0.35 + i * 0.45)}>
        <rect className="vg-tile vg-lit" x={40} y={y} width={92} height={8} rx={1} />
        <rect className="vg-tile vg-lit" x={188} y={y} width={92} height={8} rx={1} />
        <line className="vg-tie" x1={134} y1={y + 4} x2={186} y2={y + 4} />
      </g>,
    );
  }
  return (
    <>
      <rect className="vg-scan" x={36} y={12} width={248} height={12} rx={2} />
      {rows}
      <circle className="vg-approve" cx={160} cy={108} r={4} style={d(3.2)} />
      <circle className="vg-approve-ring" cx={160} cy={108} r={8} style={d(3.2)} />
    </>
  );
}

/* Launch: the proof stacks into a tower and broadcasts; the market lights up. */
function Launch() {
  const tower: ReactNode[] = [];
  for (let l = 0; l < 8; l++) tower.push(<rect key={l} className="vg-tile vg-rise" x={144} y={92 - l * 9} width={32} height={7} rx={1} style={d(l * 0.12)} />);
  const crowd: ReactNode[] = [];
  for (let k = 0; k < 14; k++) {
    const side = k % 2 ? 1 : -1;
    const step = Math.floor(k / 2);
    crowd.push(<rect key={k} className="vg-dot" x={160 + side * (36 + step * 17) - 3} y={88 + ((k * 7) % 9)} width={6} height={6} rx={1} style={d(1.3 + step * 0.22)} />);
  }
  return (
    <>
      <line className="vg-floor" x1={16} y1={100} x2={304} y2={100} />
      {[0, 1, 2].map((k) => (
        <circle key={k} className="vg-wave" cx={160} cy={26} r={30} style={d(1 + k * 0.7)} />
      ))}
      {tower}
      {crowd}
    </>
  );
}

/* Scale: one workflow (source, entry, review) repeats across entities. */
function Scale() {
  const cells: ReactNode[] = [];
  for (let k = 0; k < 8; k++) {
    const x = 22 + (k % 4) * 72;
    const y = 22 + Math.floor(k / 4) * 46;
    cells.push(
      <g key={k} className="vg-cell" style={d(k * 0.28)}>
        <rect className="vg-frame" x={x - 6} y={y - 8} width={66} height={30} rx={3} />
        <line className="vg-link" x1={x + 8} y1={y + 7} x2={x + 46} y2={y + 7} />
        <rect className="vg-tile vg-lit" x={x} y={y + 3} width={14} height={8} rx={1} />
        <rect className="vg-tile vg-lit" x={x + 20} y={y + 3} width={14} height={8} rx={1} />
        <circle className={k === 0 ? "vg-origin" : "vg-check"} cx={x + 47} cy={y + 7} r={3.5} />
      </g>,
    );
  }
  return <>{cells}</>;
}

const ART = { harvest: Harvest, prove: Prove, launch: Launch, scale: Scale };
export type ArtKind = keyof typeof ART;

export function StageArt({ kind, active, visible, motion }: { kind: ArtKind; active: boolean; visible: boolean; motion: boolean }) {
  const Art = ART[kind];
  const run = active && visible && motion;
  return (
    <span className={`clip vig vig-${kind}${run ? " playing" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid meet">
        <Art />
      </svg>
    </span>
  );
}
