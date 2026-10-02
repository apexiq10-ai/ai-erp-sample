# Rillet · System of proof

An immersive, presentable microsite for an independent Rillet product marketing proposal. Two Runway films carry the centerpiece moments; everything else is a code-built 3D ledger that re-forms on every slide. Strategy: [`STRATEGY.md`](STRATEGY.md). Approved copy and talk track: [`COPY.md`](COPY.md).

## Run it

Requires Node 20.9 or newer.

```bash
npm install
npm run dev            # http://localhost:3000
```

Production (static export into `out/`):

```bash
npm run build
npm start              # serves out/ on http://localhost:3000
```

## Present it

Open `/?present` and go full screen. Nothing advances on its own.

| Key | Action |
| --- | --- |
| → Space PageDown Enter | Next build, then next slide |
| ← PageUp Backspace | Previous build, then previous slide |
| ↓ ↑ | Same, but scroll a tall section first |
| 1 to 9 · A · Home · End | Jump to a slide, the appendix, the start, the close |
| I | Numbered index |
| M | Motion on or off |
| Esc | Close the index or a detail layer |

Inside a detail layer (04 evidence, 09 Parallel Close), the arrows move between layers and Tab stays inside. On 02, the arrows step Connect / Reason / Prove (the page scrolls to each stage); while an entry is being traced they walk its five steps instead, and Esc exits the trace. Horizontal swipes step on touch screens. `?still` starts with motion off.

**01:** moving the pointer across the frame closes the month (the stream piles into the month-end ridge and the hindsight line wipes in); moving back reopens it. On touch, drag sideways; vertical drags still scroll. → and ← go to either end, and the month slider is the keyboard equivalent.

**02:** one active stage (Connect, Reason, Prove) drives the stage controls, the scene and the explainer. Connect is a flat, quiet ledger; Reason lifts it into four tiers with chains climbing source → logic → entry; Prove adds review checkpoints, the reported line and signals on every link. The explainer has no selector of its own; it follows the stage.

**07:** the phase (Foundational, Advancing, Mature) is the deck build; the buying-journey stage is chosen on the rail (arrow keys inside it, or tap). The rail, the detail area and the scene's highlight and labels share that one value. Plays live is counted from the stage data; Justify's Advancing slot is an open slot (the TCO model was withdrawn) and is never counted.

**03:** the stack is the interface. Click or tap a layer, its numbered hotspot or its row in the list; the arrows walk the five layers; Esc returns to the overview.

**08:** Use, Value and Trust each re-form the ledger (loops of work, one compressed block, the opened structure with its review gate). Changes can be made as fast as you like; the scene always moves on from where it is.

## Test

```bash
npm test               # proof model, 01 and 03 interaction contracts (node:test)
npm run check:copy     # copy, dashes, claim discipline
```

## Edit copy

Change wording in `COPY.md` first, then in `src/content.ts`, then:

```bash
npm run check:copy
```

It fails on any on-screen string missing from `COPY.md`, any em or en dash, and any banned claim (audit-proof, zero-day close as a promise, and the rest listed at the end of `COPY.md`).

## Media

`public/media/` holds the two packaged Runway films and their poster frames, plus four 06 stage loops cut from them (`npm run media` re-cuts them). Keep everything local. To swap a film, replace the `.mp4` and its `-poster.jpg` with the same name. `reference/runway-kit/` keeps the original drop-in scene trio and its notes.

## Architecture

```
COPY.md                          approved copy deck + talk track (source of truth)
STRATEGY.md                      strategy, experience map, approvals list
src/content.ts                   every on-screen string and the section registry
src/app/                         fonts (Space Grotesk, DM Sans, JetBrains Mono), tokens and styles
src/components/Deck.tsx          controller: builds, keys, swipe, scroll mode, index, motion, footer
src/components/ui.tsx            Frame (incl. scrubbed sections), B (build), Mark, Ref, Film, StageClip
src/components/sections/Main.tsx     01 to 03, 05 to 08 (3D slides)
src/components/sections/Proof.tsx    Source / Entry / Close, the trace panel and its markers (one shared state)
src/components/proof/model.ts        the proof steps, views and reducer
src/components/sections/Scenes.tsx   04 and 09 (Runway films + detail layers)
src/components/sections/Appendix.tsx A1 to A6
src/components/world/formations.ts   where each of 900 entries sits, per slide and build; framing; camera
src/components/world/World.tsx       the three.js scene: one render loop, camera, light, picking, hotspots
src/components/world/interaction.ts  01 progress and 03 layer contracts (pure, tested)
src/components/world/store.ts        shared state between the page and the scene
scripts/check-copy.mjs           copy, dash and claim discipline check
scripts/encode-stage-clips.mjs   cuts the 06 stage loops from the Runway films
tests/proof.test.mjs             reducer tests
tests/interaction.test.mjs       01 progress, hysteresis, easing; 03 layer identity
```

## Typography

Verified on rillet.com (2 Oct 2026): headings Space Grotesk 500 in sentence case, body DM Sans 400, labels JetBrains Mono, all from Google Fonts. The main slides use the same setting; the appendix keeps its all-caps setting. next/font self-hosts the files at build (`out/_next/static/media/`): Space Grotesk is the variable Google Fonts build (Version 2.000, weights 300 to 700); rillet.com loads a static weight-500 instance of the same family from fonts.gstatic.com.

## Dev hooks

`window.__rillet` tunes framing live (`place.sXX`, `pose["sXX:step"]`). With `?awake`, a hidden page keeps the scene live but paused and `window.__advance(seconds)` renders one frame, for automated checks. Both are dev only.

## Deploy

Static export: `npx vercel` (preview) or `npx vercel --prod`, or upload `out/` to any static host. Pages are `noindex`.
