# Animation: GSAP with the Observer plugin for the Landing image stream

The desktop Landing image stream is driven by GSAP's ticker, with the Observer plugin turning wheel and touch input into a velocity boost that eases back to a constant base speed. ScrollTrigger is not used: the stream is not tied to page scroll, which the fixed Landing does not have. GSAP runs only in client components. This supersedes the "no animation library at baseline" decision in ADR 0007; CSS and `<ViewTransition>` remain the default for everything else, and `prefers-reduced-motion` disables autoplay and inertia.
