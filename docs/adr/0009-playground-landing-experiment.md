# Playground: an experimental infinite canvas replaces the Landing stream

On the experiment branch, the Landing at `/` is the Playground, an infinite draggable canvas of Project media (see `GLOSSARY.md`), and it replaces both the desktop image stream and the mobile carousel, so every device gets the same experience. The old Landing components stay in the codebase, unused, so dropping the experiment is trivial. The branch is delivered as a draft PR and is not for merge until its open decisions (identity overlay, click behaviour, intro, custom cursor, seen counter) are settled.

- **DOM and GSAP, not WebGL.** Tiles are plain links, so they stay indexable, keyboard-focusable and accessible. Only the tiles near the viewport are rendered, and everything moves by transform on one GSAP ticker, with Observer for input, as in ADR 0008. WebGL and shader effects are out of scope.
- **Layout is a pure function.** Pieces, config, camera and viewport go in; visible tiles come out. The arrangement is seeded and repeats with a fixed period, which is what makes the canvas infinite and the same on every visit.
- **Tuning with `?debug`.** Adding `?debug` to the URL, in any environment, loads Tweakpane with a dynamic import and shows a panel over every tunable value, so feel can be tuned on real devices without redeploying. Overrides persist to localStorage and apply only when `?debug` is present. "Copy config" yields JSON to paste back into the code defaults. The code defaults in `playgroundConfig` remain the source of truth, so the panel never silently changes production.
- **Playground pieces are the only source.** A `playgroundPiece` document type (image, optional video, orientation, required Project, optional caption) holds everything the canvas shows. Project covers and story Cells no longer feed it, and there is no fallback when no pieces exist. The old Project-derived mapping stays in the codebase, unused, so switching back is trivial.

ADR 0008 would be superseded for the Landing only if the experiment merges.

## Mixed layout

Mixed is the only layout; the earlier uniform grid and its `layout.mode` switch were removed. Tiles sit in horizontal rows of one height, with 4:5 portrait and 3:2 landscape widths. Orientation is chosen per Playground piece in Sanity, not guessed from the image's pixel size, and the hotspot sets the crop. Each row loops at its own length, so Project clashes and back-to-back landscapes are avoided as the period is arranged, but because row lengths differ the neighbours of a tile can change from one repeat to the next.

Tiles are shifted vertically off their row line by a sine wave along the row plus a seeded per-tile jitter. Amplitude, wave length, per-row phase step, jitter and a minimum row gap are all tunable in `?debug`. The combined offset is clamped at render time to half of (gap − minimum row gap), so no setting can make tiles in adjacent rows overlap.

## Seen counter

A pill over the canvas shows how many distinct pieces the visitor has seen out of the total (`14/52 👀`, 🎉 at full count), with a green fill for the same progress. It is experimental like the rest of the Playground.

- **Counting rule.** A piece is seen once any of its tiles has been at least `seen.threshold` visible by area (default 0.5) continuously for `seen.dwell` ms (default 300). A tile that drops below the threshold restarts its timer. The rule is a pure module, `seen.ts`, called from the frame loop; both values are tunable in `?debug`, with a "Reset seen" button.
- **Piece identity.** A piece's key is its image asset reference (the poster's for videos), not its URL, which is cropped to tile height × pixel density and so differs between screens. The total is the number of distinct keys, so one asset used twice counts once.
- **Storage.** Seen keys live in localStorage under `playground-seen` as a JSON array, read on the client only. Keys of pieces that no longer exist are dropped on load, and corrupt storage starts from zero. Nothing is synced across devices.
- **Timing.** Counting and the counter start when the intro finishes; the counter is not server-rendered. Seen tiles look no different from unseen ones.
