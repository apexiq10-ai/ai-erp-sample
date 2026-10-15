# Rillet · System of proof

Strategy for the immersive Rillet proposal site. It covers the idea, the copy, how the experience is built, how the media is made, and what still needs Rillet's sign-off.

## 1. The idea in one line

ERPs were built to remember. Rillet is built to prove. **The ledger that shows its work** is the organizing idea, and **Bring your last close** is the one next action on every surface.

The site is the argument, not a description of it. A finance leader feels the problem (the month freezing into a month-end ridge), watches the ledger become current, digs through one number to its source, and leaves with one ask.

## 2. Audience and job

| Reader | What they need from the site | What it must not do |
| --- | --- | --- |
| Rillet leadership and the hiring panel (primary) | A sharp point of view, a GTM they can interrogate, proof that the author can ship | Pretend to be an official Rillet site |
| Finance buyers (secondary, as a campaign preview) | Recognize their month in the first ten seconds; see what "provable" means | Threaten accountants or promise a zero-day close |

The site works in two modes on one page: **Present** (`?present`, keyboard or clicker, every build is one press) and **Microsite** (scroll, swipe, every section rests in its reading state).

## 3. Messaging: shorter, sharper, still respectful

Voice: written for a controller who has tied out a close at 2 a.m. Dry, specific, a little dangerous. The edge points at legacy software and the reconstruction ritual, never at accountants. Every line has to survive being forwarded to the audit partner.

| Where | Source plan | Site copy |
| --- | --- | --- |
| 01 | Your company runs in real time. Your ERP runs on hindsight. | Kept: already the sharpest line. Added kicker: *Then the month ends. And the digging starts.* |
| 02 | From event to evidence. | **Event in. Evidence out.** |
| 02 | Agents do the reconstruction. Nobody does it twice. | **Agents do the digging. Once.** |
| 02 | Every number shows its work: source, reasoning, approver. | **Source, reasoning, approver. On every number.** |
| 03 | Rillet doesn't replace the accountant. It retires the archaeology. | **We retire the archaeology, not the accountant.** |
| 03 | Agents code, accrue, allocate and recognize as entries arrive. Under your policies, not theirs. | **Coded, accrued, allocated and recognized as entries land. Your policies, not ours.** |
| 04 | A fast close at three times the volume is infrastructure. | **One fast close takes a long weekend. Three times the volume takes infrastructure.** |
| 06 | The receipts already exist. Marketing's first job is to collect them. | **The receipts exist. Job one: collect them.** |
| 07 | Be everywhere a controller looks. Except during close week. | **Everywhere a controller looks. Except close week.** *Days 1 to 7: radio silence.* |
| 08 | Reach says they heard of Rillet. Behavior says the close changed. | **Reach says they heard of us. Behavior says the close changed.** |
| 09 | Start with one close. Make it the last one anyone reconstructs. | **Bring your last close.** *One closed month. Your signed numbers. An accountable comparison.* |
| A1 | "AI-native" is becoming the category minimum… | **AI-native is table stakes. Win on proof at the customer's complexity.** |
| A3 | An ERP switch needs user demand and permission… | **Controllers create demand. Auditors grant permission. Sell to both.** |
| A6 | A claim reaches market only when… | **No claim ships without product, customer, auditor and field evidence.** |

Rules carried into the build:

- The controller is the hero of every line. "The machine prepares. The human signs."
- Specifics beat insults: a day count lands harder than an adjective.
- Banned anywhere on screen (enforced by `npm run check:copy`): audit-ready, audit-proof, zero-day close as a promise, autonomous accounting, no accountants needed, AI-powered, seamless, superintelligence, harness.
- Every figure carries its evidence status: **Claimed** (hollow square), **Illustrative** (dashed), **Hypothesis** (dashed bar), **Inference** (solid).

The full approved copy, including the 12-minute talk track, is in [`COPY.md`](COPY.md).

## 4. Experience architecture

Route: problem → value → wedge → proof chain → buyers → sequence → channels → measurement → next action. The two Runway films sit at the two moments that carry the most weight: the product insight (04) and the next action (09).

| # | Slide | Medium | Interaction |
| --- | --- | --- | --- |
| 01 | Hindsight | Code 3D: 900 entries stream across the month | **Freeze the month** collapses them into a month-end ridge; drag to turn |
| 02 | Meet Rillet | Code 3D: the current ledger, five source towers, a posting cursor, the reported line | **Connect / Reason / Prove** is scroll-driven (three viewports, pinned frame, one active stage drives label, caption and scene). **Source / Entry / Close** tabs inspect one entry. **Trace an entry** (or click any entry) re-forms the ledger into five layers with marker buttons: source event → accounting logic → journal entry → human review → reporting result |
| 03 | The wedge | Code 3D: seven manual layers float over the ledger as a dig | Each stage lowers the layers it takes on into the ledger; sign-off lands last with the approval point |
| 04 | All-nighters don't scale | **Runway**: the ledger monolith | **Explore the evidence**: descend five layers under one illustrative number |
| 05 | Buyers | Code 3D: same ledger, four vantage points | Each buyer's map opens while the camera moves to their view |
| 06 | Sequence | Code 3D band plus a **Runway loop per phase** | Phases sit under the headline. Selecting one plays its clip, shows its beat caption and lights its platform: Harvest (loose evidence collected into piles), Prove (a second ledger assembles in registration, a review point lights), Launch (the tower), Scale (rings repeat outward) |
| 07 | Channels | Code 3D: a 30-day calendar ring; close week flattened; 15 play beacons | Phase tabs light 6, 12, 15 plays |
| 08 | Measurement | Code 3D: a cloud of impressions falls into four solid columns | Select Use, Value, Trust, Commercial |
| 09 | Bring your last close | **Runway**: slabs and one evidence line | **See the Parallel Close**: Scope, Replay, Tie out, Decide |
| A1 to A6 | Appendix | Warm-paper editorial exhibits | One page per press; evidence footers deep-link here |

Navigation everywhere: numbered index (`I`), previous / next in the footer, arrow keys, wheel and scroll, horizontal swipe, `1` to `9`, `A`, `Home`, `End`, `M` for motion, `Escape` closes any layer.

## 5. Visual system

Art direction follows Colossal's composition and pacing (full-bleed media, monumental type, sparse numbered index) without borrowing anything from it.

- **Palette:** near-black `#080809`, graphite, silver `#C5C3C4`, warm white `#F1F0EE`. Rillet purple `#644EFF` is an accent only: underlines, the selected state, the live dot, evidence and approval points. Deep violet `#240257` stays in shadow; lavender `#C1C6FE` carries fine annotations.
- **Type (verified on rillet.com, 2 Oct 2026):** computed styles on the home page and product pages (close management, Aura AI) show headings in **Space Grotesk 500** (letter-spacing −0.5px at 36–40px, −0.25px at 18–32px), body in **DM Sans 400**, and eyebrows and index numbers in **JetBrains Mono** (200 labels, 500 numbers). All three load from Rillet's Google Fonts stylesheet and are SIL Open Font License, so this site self-hosts the same families through `next/font` with `font-display: swap`. Tokens: `--font-brand-display`, `--font-body`, `--font-mono`. The Rillet wordmark is a separate inline SVG and is not used. The main slides set headlines in Rillet's own sentence case; the appendix keeps its all-caps exhibit headlines.
- **One world:** the code-built scenes use the same materials as the films (brushed-metal entries, a black studio, a raking key light, white filaments, violet only where evidence or approval lives), so the 3D and the Runway footage read as one place. Violet never appears on slide 01: there is no proof before Rillet arrives.
- **Legibility:** directional gradients and grain, never boxed panels over the films.

## 6. Media: Runway and code

| Asset | Source | Treatment |
| --- | --- | --- |
| `ledger-monolith.mp4` | Runway task `98290f42…` (10 s, 1920×1080, silent) | Full bleed on 04, slight greyscale and contrast, left-weighted gradient; pans with the pointer; descends as the viewer traces layers |
| `bring-your-last-close.mp4` | Runway task `61f13fb4…` (10 s, reframed to remove a pseudo-label) | Full bleed on 09 with a stronger left gradient |
| Posters (`*-poster.jpg`) | Frames from each film | Loading, reduced-motion and failure state |
| 06 phase animations (Harvest, Prove, Launch, Scale) | Code-built SVG in `Vignettes.tsx`; no film footage, so the 04 and 09 films are never repeated | 06 phase cards. Run only while their phase is selected, on screen and motion is on; otherwise, and under reduced motion, they rest on the finished frame |
| The month, the ledger, the dig, the proof stack, the ring, the columns | Code (three.js via React Three Fiber) | Interactive, re-forms per slide, 0.44 ms per frame update cost |

**Open asset dependency:** the four 06 loops reuse footage from the 04 and 09 films. Dedicated Runway clips would be stronger (no Runway connector was available to generate them). Drop new files in with the same names and nothing else changes. Prompts: *Harvest:* "loose graphite tiles drift down and stack into ordered piles in a black studio, slow push-in." *Prove:* "two identical slab ledgers slide into registration, fine white threads join matching rows, one violet point lights." *Launch:* "a single graphite tower rises from the floor under a raking key light." *Scale:* "the same small ledger unit repeats outward in rings across a dark floor, camera rising."

Films are muted, looped, inline, and paused whenever the section is off screen, the tab is hidden, or motion is off. All words and controls are HTML. The footage is labelled *Illustrative motion · not product footage*.

**Optional next clips** (same Runway look, only if the panel will see the site on a big screen):

1. *Cold open, 6 s:* "A vast black studio; thousands of thin graphite tiles drift left to right at different speeds like live transactions; slow dolly; at the end they stop mid-air as if time froze; silver highlights, no words or UI." Use as a 2-second pre-roll before 01's 3D takes over.
2. *Social cut, 9:16, 8 s:* the monolith film reframed vertically with the 04 headline added in the edit, for LinkedIn posts that link to the Parallel Close.

## 7. Build

- **Stack:** Next.js 16 static export, React 19, three.js + @react-three/fiber. No backend, no keys, works offline once built.
- **Engine:** forked from the approved Chainalysis presentation engine (builds, keyboard, scroll mode, index, deep links). Every Chainalysis string is gone.
- **Copy lock:** `src/content.ts` holds every on-screen string; `npm run check:copy` fails on any string not in `COPY.md`, any em or en dash, or any banned claim.
- **World:** `src/components/world/formations.ts` holds pure layout functions (where entry *i* sits for a slide and build), per-slide framing and camera poses; `World.tsx` smooths 900 instances toward them, draws filaments and evidence points, and anchors labels and the inspector card.
- **Proof model:** `src/components/proof/model.ts` holds the five step ids, the three Source / Entry / Close views (each targets a step) and one reducer (view, open, step, next, back, exit). `Proof.tsx` renders the tabs (tablist semantics, arrow keys, `aria-selected`), the trace panel (Back, Next, direct selection, Exit) and the marker buttons; the 3D scene reads the same state and positions the markers on the layer anchors every frame. `npm test` covers the transitions.
- **Scenes:** `src/components/sections/Scenes.tsx` ports the Runway kit's two scenes and their layers (focus trap, arrow keys, swipe, Escape, focus return). The original kit is preserved in `reference/runway-kit/`.

## 8. Verified

- 1280×720 primary, plus 1440×900 and 375×812. Headline sweep at 320, 768, 1280, 1440: no clipping or horizontal overflow; the 02 heading is 69px at 1280 and 81px at 1440 (+23 to 24%).
- 02: tabs by click and arrow keys; scroll stages switch at the centre line; trace opens on step one with focus, markers and panel stay in sync, keys walk the steps without moving the slide, Escape and Exit return focus to the trigger, reopening restarts; markers stay on their layers after resizing. Phones get a stacked step list instead of markers.
- 06: one clip plays at a time, only when selected and on screen; it pauses offscreen and with motion off; a broken clip falls back to its poster and caption.
- Every build reachable by key, click and swipe; both detail layers navigable by pointer, arrows and Tab, with focus returned on close.
- Motion toggle pauses films and freezes the world (tested). `prefers-reduced-motion` starts with motion off, disables the toggle and snaps transitions (checked in code; the preview browser cannot emulate the setting). `?still` forces stills.
- Film failure falls back to the poster frame (tested by breaking the source).
- No console errors; production build and copy check pass.

## 9. Needs Rillet approval before anything goes external

1. **Brand line and framing:** "The ledger that shows its work" and the system-of-proof story (built on the CEO's "system of verifiable proof").
2. **Parallel Close mechanics:** can Implementation replay a closed period, at what scope, duration and fee, with which auditor involvement. Shown as a proposed motion only.
3. **Product mechanics depicted:** continuous ledger updates, agents acting inside the posting workflow, an end-to-end evidence chain, and where human approval sits.
4. **Agent name and integrations:** "Aura" (one page reportedly says "Genie"); Aura's connections to Salesforce, Snowflake and Claude.
5. **Customer proof:** Mercor (past $2B ARR, three-person finance team), Function Health, public-company references. Permission to use each in sales material.
6. **Partner claims:** the EY alliance and "official partner to more than half of the Accounting Today top 20."
7. **A1 competitor cells:** a primary-source check for every cell, and Legal's position on naming competitors.
8. **Illustrative figures:** the $4.28M reported line, 184 entries, and the generated inspector entries are samples. Confirm they read as illustrative.
9. **Close-calendar rule:** days 1 to 7 as a default, validated against real account calendars.
10. **State of the Close:** whether customer contracts allow aggregated close benchmarks.
11. **Logo:** the typographic "Rillet" mark is a stand-in until an approved logo is supplied.
