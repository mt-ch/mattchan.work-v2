# Repo structure: three component buckets, one Sanity client, a site route group

Carried forward from v1 ADR 0006 without the assistant and transition parts, which v2 drops.

- `components/` has exactly three buckets with nothing loose at the root: `ui/` (generic, no domain knowledge), `layout/` (site chrome), `features/` (one folder per domain concept or page section). "Where does this go" is answerable from those definitions alone.
- `lib/sanity` is the only place that constructs the Sanity client.
- A theme constants module defines the theme storage key, dark-mode attribute and media query once, shared by the pre-hydration script and the hook.
- `app/(site)` is a route group that owns site chrome, so `/studio` renders none of it. Route groups do not change URLs.
