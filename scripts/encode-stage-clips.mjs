// Cut the 06 stage loops from the packaged Runway films in public/media.
// Each beat is a distinct segment and crop of local Runway footage: muted,
// H.264, faststart, 640x360, with a poster frame. Replace any output with a
// dedicated clip of the same name and the site picks it up unchanged.
import { execFileSync } from "node:child_process";
import path from "node:path";
import ffmpeg from "ffmpeg-static";

const media = path.resolve(process.cwd(), "public/media");
const CLIPS = [
  // Harvest: the studio of slabs, ordered rows (collected and organized)
  { out: "stage-harvest", src: "bring-your-last-close", from: 0.2, dur: 3.4, crop: "iw*0.82:ih*0.82:iw*0.09:ih*0.1" },
  // Prove: filaments join the strata, violet review points (connected, reviewed)
  { out: "stage-prove", src: "heroics-ledger-monolith", from: 2.4, dur: 3.6, crop: "iw*0.7:ih*0.7:iw*0.12:ih*0.12" },
  // Launch: the whole monolith comes into view (a story the market can see)
  { out: "stage-launch", src: "heroics-ledger-monolith", from: 6.6, dur: 3.3, crop: "iw*0.9:ih*0.9:iw*0.05:ih*0.05" },
  // Scale: one evidence line running across every slab (repeats across entities)
  { out: "stage-scale", src: "bring-your-last-close", from: 5.6, dur: 3.6, crop: "iw*0.86:ih*0.86:iw*0.07:ih*0.07" },
];

for (const c of CLIPS) {
  const input = path.join(media, `${c.src}.mp4`);
  const vf = `crop=${c.crop},scale=640:360:flags=lanczos,format=yuv420p`;
  execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-ss", String(c.from), "-t", String(c.dur), "-i", input, "-vf", vf, "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-movflags", "+faststart", path.join(media, `${c.out}.mp4`)]);
  execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-ss", String(c.from + 0.4), "-i", input, "-vf", `${vf},eq=brightness=-0.02`, "-frames:v", "1", "-q:v", "4", path.join(media, `${c.out}.jpg`)]);
  console.log(`${c.out}.mp4 + .jpg  ←  ${c.src} ${c.from}s +${c.dur}s`);
}
