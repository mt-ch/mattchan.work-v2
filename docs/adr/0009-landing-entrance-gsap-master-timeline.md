# Landing Entrance: one GSAP master timeline over the real stream nodes

The Landing Entrance is one GSAP master timeline, owned by a client component that wraps the page and finds its elements through `data-entrance` attributes. It animates the real stream and carousel nodes rather than a separate overlay, so there is no loader to hand off from and no second copy of the tiles. This extends ADR 0008: GSAP already runs only in client components, and the stream and carousel are created paused and started by the timeline's final step, which also marks the Entrance done so tile videos begin to load.

A tiny inline script in the document head runs on hard loads of `/` only and marks `<html>` as Entrance-pending (or with a reduced-motion variant). CSS gated on that mark hides the page and makes it inert until the timeline completes, so the finished layout never flashes. Client-side navigation does not re-run the script, so it shows no Entrance, and no sessionStorage is needed to remember that. A `<noscript>` style cancels the hiding so the page renders without JavaScript. The reduced-motion variant is a 0.4s page fade with no counter and no gate.

The Entrance's tunable values live in one typed config module. In development, `?entrance` mounts GSDevTools on the master timeline; the import sits behind a production check so it is not in production bundles.
