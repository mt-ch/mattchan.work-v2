# Queue: a 3D card fan replaces the Playground at the Landing

Supersedes the Landing decision of ADR 0009 (itself superseded by ADR 0011, which removes the unmounted code mentioned below). On the experiment branch, `/` shows the Queue (see `GLOSSARY.md`) instead of the Playground: a diagonal fan of uniform 4:5 cards in CSS perspective, far at the top-right and near at the bottom-left. The Playground modules stay in the codebase, unmounted, so dropping the experiment is trivial. The branch is still not for merge to main.

- **Same content source.** Playground pieces from Sanity, in Sanity order, with no schema change and no fallback when none exist. Cards ignore a piece's orientation and crop every image 4:5 around its hotspot.
- **DOM, GSAP and CSS 3D.** Cards are plain links (`translate3d`, `rotateY`, `perspective`), so they stay indexable, focusable and accessible. No WebGL. ADR 0008 and 0009's choice of GSAP ticker and Observer for motion carries over to the later motion slices.
- **Layout is a pure function.** `layoutQueue` takes the piece count, config, a fractional scroll position and the viewport, and returns the rendered cards with transform values, a depth rank and a focus flag. Indices wrap by modulo, so the Queue has no end. About 10 to 14 cards are rendered around the focus card (3 nearer, 9 farther by default).
- **Defaults are the source of truth.** `queueConfig` holds every tunable value, matched by eye from the reference clip. Live tuning behind `?debug` comes in a later slice.
- **Left out of the experiment.** The seen counter, intro, identity overlay and custom cursor stay in the repo, unused.
