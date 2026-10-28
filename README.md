# mattchan.work v2

Next 16 (Cache Components), React 19, Tailwind 4, Sanity 6 embedded at `/studio`. See `GLOSSARY.md` and `docs/adr/`.

## Setup

```sh
pnpm install
cp .env.local.example .env.local   # fill in the Sanity project id
pnpm dev
```

## Scripts

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (Vitest): run in CI.
- `pnpm build`: needs `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`.
- `pnpm test:e2e`: Playwright smoke suite. Local only for now; run `pnpm exec playwright install chromium` once.

## Sanity webhook

Content changes reach the site through `POST /api/revalidate`, which invalidates cache tags (ADR 0003). Configure a webhook on the `v2` dataset:

- URL: `<site origin>/api/revalidate`, method POST
- Filter: `_type in ["project", "about"]`; trigger on create, update and delete
- Projection: `{_type, "slug": slug.current}`
- Secret: same value as `SANITY_REVALIDATE_SECRET`
