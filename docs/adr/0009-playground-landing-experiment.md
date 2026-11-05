# Playground: an experimental infinite canvas replaces the Landing stream

On the experiment branch, the Landing at `/` is the Playground, an infinite draggable canvas of Project media (see `GLOSSARY.md`), and it replaces both the desktop image stream and the mobile carousel, so every device gets the same experience. The old Landing components stay in the codebase, unused, so dropping the experiment is trivial. The branch is delivered as a draft PR and is not for merge until its open decisions (identity overlay, click behaviour, intro, custom cursor) are settled.

- **DOM and GSAP, not WebGL.** Tiles are plain links, so they stay indexable, keyboard-focusable and accessible. Only the tiles near the viewport are rendered, and everything moves by transform on one GSAP ticker, with Observer for input, as in ADR 0008. WebGL and shader effects are out of scope.
- **Layout is a pure function.** Pieces, config, camera and viewport go in; visible tiles come out. The arrangement is seeded and repeats with a fixed period, which is what makes the canvas infinite and the same on every visit.
- **Tuning with `?debug`.** Adding `?debug` to the URL, in any environment, loads Tweakpane with a dynamic import and shows a panel over every tunable value, so feel can be tuned on real devices without redeploying. Overrides persist to localStorage and apply only when `?debug` is present. "Copy config" yields JSON to paste back into the code defaults. The code defaults in `playgroundConfig` remain the source of truth, so the panel never silently changes production.
- **No schema change.** Tiles come from existing Project cover and story Cell fields, so new media added in Sanity appears automatically.

ADR 0008 would be superseded for the Landing only if the experiment merges.

## Mixed layout mode

`layout.mode` switches the Playground between **uniform** (the default; one 4:5 tile shape on a staggered grid) and **mixed**, switchable in `?debug`. Mixed mode lays tiles in horizontal rows of one height, with 4:5 portrait and 3:2 landscape widths taken from each piece's own source dimensions (the poster, for videos). Each row loops at its own length, so Project clashes and back-to-back landscapes are avoided as the period is arranged, but because row lengths differ the neighbours of a tile can change from one repeat to the next. Production stays on uniform until the code default changes.
