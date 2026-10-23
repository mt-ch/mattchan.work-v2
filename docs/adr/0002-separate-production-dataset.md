# One new Sanity dataset, separate from v1

Carried forward from v1 ADR 0002, amended. The principle holds: a single production dataset, no dev/prod split, because the owner is the only editor and a bad edit is cheap to fix in place. The amendment is that v2 uses a brand-new dataset that is not shared with v1's `production` dataset, so v2's schema changes (for example dropping `experience`) cannot affect the live v1 site. How v1 and v2 coexist and when v2 cuts over is decided separately in #7.
