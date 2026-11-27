# Queue: locked in as the Landing, Playground and old Landing code removed

Supersedes ADR 0009 and the "stay in the codebase, unmounted" part of ADR 0010. The Queue (see `GLOSSARY.md`) is the Landing at `/`, so the code kept only for switching back is gone: the desktop stream and mobile carousel, the Playground canvas with its motion, layout, intro, seen counter and Tweakpane panel, and the Project-derived piece mapping with its query.

- **Kept.** The `playgroundPiece` Sanity document type and `getPlaygroundPieces` stay as the Queue's only content source; they are not renamed, to avoid a schema migration. `orientation` and the piece mapping moved into `components/features/queue/`.
- **Live tuning stays for now.** The Queue's own `?debug` Tweakpane panel, localStorage overrides and "Copy config" are kept while the values are still being tuned. `queueConfig` in code remains the source of truth. Every config knob stays until tuning settles; neutral or redundant ones are pruned after that.
- **Still true from ADR 0010.** DOM, GSAP and CSS 3D, no WebGL; layout is a pure function.
