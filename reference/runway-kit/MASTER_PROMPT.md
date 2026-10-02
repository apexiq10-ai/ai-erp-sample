# Master prompt for the AI builder

Build a cinematic, interactive Rillet product marketing experience from this package. The **Runway motion pieces are the centerpiece**. Integrate the two 3D scenes, retain their navigable content, verify the result, and return a working preview and source.

## Start here

- `embed/rillet-scenes.html`, `embed/rillet-scenes.css`, `embed/rillet-scenes.js` are the three ready-to-embed source files.
- `embed/heroics-ledger-monolith.mp4` and `embed/bring-your-last-close.mp4` are the two packaged Runway motion files. Keep them local; do not depend on temporary Runway URLs.
- `dist/` is a standalone preview of the same two-scene experience.
- `STRATEGY.md` provides the larger positioning and GTM context. `RUNWAY_ASSETS.md` identifies the media.

If the original [Vercel project](https://vercel.com/arthur-su1/chainalysis-assignment) is accessible, reuse useful navigation/presentation mechanics and remove all Chainalysis content. If not, use this package as the starting implementation. Do not block on that project's access.

## Art direction

Use [Colossal](https://colossal.com/) as a **composition and pacing reference**: full-bleed cinematic media, monumental editorial headlines, a sparse numbered index, and immersive transitions. Do not copy its marks, imagery, content, or code. The result should feel as ambitious and controlled, built for a finance audience.

Use Rillet's current public brand cues with restraint. The composition should be **mostly near-black, graphite, silver, and warm white**. Rillet purple `#644EFF` is an accent for an underline, selected state, tiny evidence light, or point of approval. Deep violet `#240257` may appear in shadows. Lavender `#C1C6FE` can support fine annotations. Do not flood the background or giant headlines with purple. Use Space Grotesk for display and DM Sans for support copy, with system fallbacks. The prototype uses a typographic “Rillet” mark; replace it with an approved official logo if provided.

## Scene 1: Heroics don't scale

The Runway `heroics-ledger-monolith.mp4` should fill the frame. Place this headline in HTML over dark negative space:

> HEROICS DON'T SCALE. LEDGERS DO.

Supporting line: “A fast close once is a long weekend. At three times the volume, it takes infrastructure.”

An understated “Explore the evidence” action opens a full-screen editorial layer. It must let the viewer trace one illustrative number through **reported line → journal entries → source events → agent proposal → human approval**. Each click changes the content and active state. Keep the $4.28M sample clearly illustrative. The interaction should feel like descending through evidence, not using a dashboard widget.

## Scene 2: Bring your last close

The Runway `bring-your-last-close.mp4` should fill the frame. Place this headline in HTML:

> BRING YOUR LAST CLOSE.

Supporting line: “One closed month. Your signed numbers. An accountable comparison.”

“See the Parallel Close” opens four navigable editorial steps: **Scope, Replay, Tie out, Decide**. The copy must specify a controller sponsor, a signed period, documented differences, and a human decision. This is a proposed evaluation motion; do not imply it is already a priced or guaranteed Rillet offer.

## Media and interaction rules

1. Keep all text, captions, controls, and qualifiers in code. Runway footage is illustrative atmosphere, never product footage or customer data.
2. Use the two local MP4s in the package. They should be muted, looped, `playsinline`, and paused when inactive or hidden. Preserve a readable static fallback if video fails or reduced motion is requested. Keep the user's motion toggle.
3. Make navigation feel light: numbered index, previous/next, scroll or wheel, horizontal swipe, and keyboard arrows. `Escape` closes overlays. The evidence and Parallel Close steps must be clickable and keyboard navigable.
4. Maintain readable contrast over moving frames. Use a directional gradient and framing, not a boxed HUD. Avoid persistent panels over the hero video.
5. Make 1280 × 720 the primary composition, then adapt for 1440 × 900 and mobile. On small screens, preserve the media and allow the detail view to scroll.
6. The source trio must remain standalone. If porting into React or another system, preserve its behavior and copy. `window.RilletScenes.mount(root, { videoUrls: { heroics, close } })` is available for plain HTML integration.

## Claim discipline

This is an independent proposal. Do not say “audit-proof,” guarantee a zero-day close, suggest replacing accountants, or turn illustrative data into a product claim. The controller is the hero. The edge targets the reconstruction ritual and old software. Use “The ledger that shows its work” as the organizing idea and “Bring your last close” as the next action.

## Acceptance criteria

- Both Runway clips load from local files and display full-bleed without stretching.
- The visual impression is cinematic and editorial, with purple limited to accents.
- Both scenes, five evidence layers, and four Parallel Close steps navigate by pointer, keyboard, and touch.
- Motion pause, reduced-motion behavior, media fallback, responsive layout, focus states, and text contrast work.
- No Chainalysis content, faux product UI, unsupported performance numbers, or AI-generated pseudo-text is visible in the final composition.
- Return final files, a working preview, and a short list of claims or product mechanics still needing Rillet approval.
