# Styling: Tailwind 4 with CSS-first tokens, no Sass

v2 styles with Tailwind 4 configured in CSS: design tokens are plain CSS variables exposed through `@theme inline`, and dark mode is a `data-theme` attribute variant. Sass is dropped because Tailwind v4 is not designed to be used with preprocessors. The baseline needs no animation library: it uses CSS and React's `<ViewTransition>`, and a library such as `motion` is added only if #17 needs it, with its own ADR.
