# v2 stack choices and ADR carry-over

Research for GitHub issue #8 (part of map #2). Verified 2026-10-23 against primary sources only (official docs, release notes, npm registry metadata, v1 repo). Nothing here is a decision; it is a recommendation for the owner to accept in #8.

Placement note: this repo has no existing notes convention (`docs/` only holds `docs/agents/`; there is no `GLOSSARY.md` or `docs/adr/` yet, so those are #9's job). This file therefore uses the fallback `docs/research/v2-stack-choices.md`.

## Summary of recommendations

1. **Next.js 16.4.3** (stable, Active LTS line), React 19.3, Node 22 LTS. Do not wait for Next 17 (not released). Enable Cache Components in the scaffold, which Next now recommends for every new app, but see the ADR 0003 risk below.
2. **Tailwind CSS 4.3.3, CSS-first** (`@theme inline` over plain CSS variables, `data-theme` custom variant). Drop Sass.
3. **Animation: no library in the baseline.** Native CSS plus React 19.3's now-stable `<ViewTransition>`. If #17 needs React-orchestrated enter/exit, add `motion` (14.x) only. Do not carry GSAP or Lenis.
4. **Testing: Vitest 5 + React Testing Library + jsdom for units, plus a small Playwright E2E smoke suite** (v1 had no E2E; Next says Vitest cannot test async Server Components).
5. **ADRs:** carry 0001, 0002 (amended), 0003 (amended), 0004 as new v2 ADRs; carry 0006 in reduced form; do not carry 0005, 0007, 0008, 0009, 0010, 0011, 0012, 0013, 0014 (moot or already superseded by #5/#6).

## Context (from the repo and issues)

- Issue #8 asks for: next version, styling, animation library, testing setup, and carry/supersede per v1 ADR 0001-0014. It is blocked by #4 and #5 (both done) and blocks #9 (scaffold: Next, embedded Studio, lint/typecheck/test/CI, `GLOSSARY.md`, `docs/adr/`).
- Map #2 decisions already made and binding on this note: drop Ask, custom cursor, Lenis, page transitions (#5); theme via `data-theme` plus pre-hydration script, dark only at launch, both themes in tokens (#5, #10); new Sanity dataset and `experience` dropped (#6); Figma only has spacing variables so the rest of the token system is built in code (#3); scope is Landing and Work only. #17 (motion pass) is a placeholder that may add "a simpler view transition between Landing and Work".
- v1 `package.json` (read from a fresh clone, treated as data): next ^16.2.12, react ^19.2.8, tailwindcss ^4.3.3 + `@tailwindcss/postcss`, `sass` ^1.102 (tokens in `styles/*.scss`), motion ^13.1.1, gsap ^3.15, lenis ^1.3.26, next-view-transitions ^0.3.5, vitest ^4.1.10, @testing-library/react ^16.3.2, jsdom ^30, @vitejs/plugin-react ^6, eslint ^9.39, typescript ^5.9.3, sanity ^6.8, next-sanity ^13.2.3, pnpm 11.18.0. v1 `vitest.config.ts` uses jsdom, globals, a `@` alias. A grep of v1 `package.json`, `CLAUDE.md` and `README.md` for `playwright`/`e2e` found nothing, so v1 has no E2E tests.

## 1. Next.js version

**Recommendation: `next@16.4.3` (current `latest` on npm), React 19.3.x, Node 22.x LTS, pnpm as in v1.**

Evidence:
- npm `dist-tags.latest` for `next` is 16.4.3, published 2026-10-23; `canary` is 16.5.0-canary.25, and there is no 17.x tag (npm registry, `npm view next dist-tags`).
- Next.js 16.4 was announced 2026-10-06. It recommends Cache Components "as the best choice for every Next.js app", makes it the `create-next-app` default, says it "will become the default in Next.js 17", and ships React 19.3 (https://nextjs.org/blog/next-16-4). The release notes for v16.4.3 are a backport/bug-fix release tagged `lts-active` (https://github.com/vercel/next.js/releases/tag/v16.4.3).
- Support policy: 16.x is Active LTS, 15.x Maintenance LTS; "serve production applications with either the latest Active or Maintenance LTS release" (https://nextjs.org/support-policy).
- Security cadence is high (out-of-band security updates on 2026-09-22 and 2026-10-14, https://nextjs.org/blog). Pin to a patched 16.4.x and keep `experimental.agentUpgrade: 'security'` (the documented default) so reminders surface.
- Node: `next@16.4.3` declares `engines.node >=20.9.0` (npm metadata). But `vitest@5.0.5` needs `^22.12 || ^24 || >=26` and `sanity@6.20.0` needs `>=22.12` (npm metadata), so use Node 22 (v1 CI already uses Node 22 per the #4 audit) or 24.
- React 19.3 (2026-09-09) makes `<ViewTransition>` and Fragment Refs stable (https://react.dev/blog/2026/09/09/react-19-3).
- Sanity compatibility: `next-sanity@13.3.4` peers are `next ^16.0.0-0`, `react ^19.2.3`, `sanity ^5.29 || ^6` (npm metadata). Sanity's docs require next-sanity 13.1.5+ for the App Router guide and list a next-sanity v13.0.0 changelog entry titled "Cache Components support" (https://www.sanity.io/docs/visual-editing/visual-editing-with-next-js-app-router). I could not verify from primary sources that the embedded Studio route works under `cacheComponents: true`; test this in #9.

Decision point for #9 (Cache Components vs the v1 caching model): v1 ADR 0003 uses a webhook route that calls `revalidatePath` per document type. `revalidatePath` still exists and works in route handlers (https://nextjs.org/docs/app/api-reference/functions/revalidatePath), but the Cache Components model is organised around `'use cache'`, `cacheLife` and `cacheTag`, and the revalidatePath docs say path revalidation does not refresh other pages sharing data tags. Next's own caching guide says non-Cache-Components apps should use the older "Caching and Revalidating (Previous Model)" guide (https://nextjs.org/docs/app/getting-started/caching). Recommendation: scaffold with `cacheComponents: true` and `partialPrefetching: true` (Next requires setting both explicitly), tag Sanity fetches (`cacheTag`), and change the webhook route to tag-based invalidation. If that proves rough in #9 with the embedded Studio, fall back to the previous model; either way ADR 0003's decision (on-demand via webhook) is unchanged, only the mechanism. For a two-route portfolio, `ensureStatic = 'navigation'` (new in 16.4) is a cheap guard against accidental request-time rendering (https://nextjs.org/blog/next-16-4). Not verified: whether `ensureStatic` is stable or experimental in 16.4.3 beyond what the blog states.

TypeScript and ESLint (tooling versions, brief):
- ESLint: `eslint-config-next` supports ESLint 9 and 10, with ESLint 10 needing Node `^20.19 || ^22.13 || >=24`, and some bundled plugins may warn on peers (https://nextjs.org/docs/app/api-reference/config/eslint). npm `latest` for eslint is 10.13.0. Recommend staying on ESLint 9 (v1's) unless there is a reason; moving to 10 is optional.
- TypeScript: npm `latest` is 7.0.2. Next documents TS 7 support only via the project-local `tsc` CLI, with caveats (no Next-specific code frames), and `experimental.useTypeScriptCli` is flagged experimental (https://nextjs.org/docs/app/api-reference/config/typescript). Recommend keeping TS ^5.9 for the scaffold. Not verified: whether `sanity typegen`, typescript-eslint and Vitest tooling are all clean on TS 7.

## 2. Styling approach

**Recommendation: Tailwind CSS 4.3.3 via `@tailwindcss/postcss`, tokens as CSS variables in plain CSS, `@theme inline` bridge, `data-theme` dark variant. Remove Sass.**

Evidence:
- Tailwind v4.3 is current (2026-05-08); no v5 mentioned on the blog index (https://tailwindcss.com/blog). npm `latest` is 4.3.3. Note for risk: the same page lists that Tailwind Labs announced it is joining Shopify (2026-09-09); I did not find a stated impact on the framework's licence or roadmap.
- Next's CSS guide: "Use Tailwind CSS for most styling needs", CSS Modules for component-specific styles when utilities are not enough; install is `tailwindcss @tailwindcss/postcss` plus `@import 'tailwindcss'` (https://nextjs.org/docs/app/getting-started/css).
- Tailwind says v4 "is not designed to be used with CSS preprocessors like Sass, Less, or Stylus", and that nesting and variables need no preprocessor. Browser baseline is Chrome 111, Safari 16.4, Firefox 128 (https://tailwindcss.com/docs/compatibility). v1 mixes both (SCSS `tokens.scss`, `functions.scss`, `utilities.scss` plus `@import "tailwindcss"`), which is outside Tailwind's supported path.
- Theme tokens: `@theme` variables create utilities; `@theme inline` is needed when a token references another variable so the value resolves per element (https://tailwindcss.com/docs/theme). That is exactly the light/dark pattern needed for #10: raw per-theme values on `:root` / `[data-theme=dark]`, bridged into `@theme inline`. The theme doc's own light/dark snippet is labelled by the fetch as an extension of its guidance, not a verbatim doc example; verify in #10.
- Dark variant by attribute, which matches the #5 decision: `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));` (https://tailwindcss.com/docs/dark-mode). v1 used a `.dark` class; v2 should use `data-theme` as #5 states.
- CSS Modules remain available as an escape hatch (same Next CSS guide). Keep `prettier-plugin-tailwindcss` (v1 already has it; not re-verified against current version).

Note: v1's two-layer token pattern (bare custom properties on `:root`, restated in `@theme`) is sound and ports directly, just in `.css` rather than `.scss`.

## 3. Animation library

**Recommendation: ship the baseline with no animation library. Use CSS for micro-interactions and React's `<ViewTransition>` for any Landing to Work transition. If #17 needs enter/exit orchestration, add `motion` 14.x only. Do not carry GSAP, Lenis or `next-view-transitions`.**

Evidence:
- #5 already removed the things that needed GSAP and Lenis in v1 (custom cursor, page-transition overlay, smooth scroll). ADR 0009 says GSAP "remains the custom cursor's and the page transition overlay's engine", and ADR 0014's GSAP SplitText `HeadingReveal` is the only other GSAP use found; none are in v2 scope as decided. Dropping them removes dependencies (gsap, @gsap/react, lenis, next-view-transitions).
- React 19.3 made `<ViewTransition>` stable, with `addTransitionType` for directional animation (https://react.dev/blog/2026/09/09/react-19-3). Next's guide says view transitions "work in the App Router with no configuration", `<Link transitionTypes>` is supported, route navigations are Transitions so they animate automatically, and without browser support "your application works normally; the transitions do not animate" (https://nextjs.org/docs/app/guides/view-transitions). That supersedes the third-party `next-viewtransitions` v1 used, and fits #5's "simpler view transition between Landing and Work". The guide also gives a reduced-motion CSS block to copy. Caveat from the same page: needs Chromium 125+ or recent Safari/Firefox for transition types, and Safari may behave differently.
- If a library is needed: `motion` is at 14.6.0 (2026-10-20); the upgrade guide lists 14.0 as "no breaking changes" (v1 is on 13, whose only break was no longer bundling `@emotion/is-prop-valid`), and peers are React `^18 || ^19` (https://motion.dev/docs/react-upgrade-guide, https://github.com/motiondivision/motion/blob/main/CHANGELOG.md via raw file, npm metadata). I did not verify bundle size figures; use `LazyMotion`/`m` per the same guide if size matters.
- GSAP is not a licensing blocker: GSAP's standard-license page states "GSAP is now free for everyone, thanks to Webflow's support" (https://gsap.com/standard-license/). It is rejected here on scope, not cost. npm shows 3.15.0 as latest (unchanged from v1). I could not confirm from that page whether SplitText has any separate terms.
- If any motion returns, v1's `lib/motion/environment.ts` seam (reduced-motion / view-transition support / viewport) is worth keeping, per the #4 and #5 notes. v1 ADR 0009's rule that duration and easing tokens are the only source of timing is also worth carrying into the motion ADR if #17 adds motion.

## 4. Testing setup

**Recommendation: Vitest 5.0.5 + React Testing Library + jsdom for unit/component tests (keep v1's behaviour-not-markup philosophy), plus Playwright 1.64 for a thin E2E smoke suite on Landing and Work. No Jest, no Cypress.**

Evidence:
- Next documents Vitest, Jest, Cypress and Playwright; for Vitest "does not support" `async` Server Components and recommends E2E for them (https://nextjs.org/docs/app/guides/testing/vitest, https://nextjs.org/docs/app/guides/testing). A server-rendered Sanity-fed portfolio will have async server pages, so some E2E is warranted; a handful of Playwright tests is proportionate.
- Playwright guidance: run against `next build` + `next start` for closeness to production, or use `webServer` (https://nextjs.org/docs/app/guides/testing/playwright). With Cache Components, `@next/playwright`'s `instant()` helper asserts what is visible immediately after navigation (same page). Not evaluated beyond that.
- Vitest 5 was released 2026-09-03; requires Vite >= 6.4.0 and Node >= 22.12.0; breaking changes include `clearMocks` defaulting to `true`, unawaited `resolves`/`rejects` now failing, and fake timers also mocking `Temporal` (https://vitest.dev/blog/vitest-5). npm: vitest 5.0.5 peers `vite ^6.4 || ^7 || ^8`, jsdom `*`. v1 is on Vitest 4.1, so porting v1 tests/config means reading the migration guide (linked from the blog; I did not read it in full).
- Versions currently on npm: @playwright/test 1.64.1, @testing-library/react 16.3.3, jsdom 30.1.3, @vitejs/plugin-react 6.1.2.
- Next's Vitest guide lists `vite-tsconfig-paths` for path aliases; v1 uses a hand-written `@` alias in `vitest.config.ts`. Either works; keep v1's if `tsconfig` has a single `@/*` path.
- v1 test philosophy (ADR 0006, "assert behaviour, not markup") and the pure-seam pattern (`lib/seo`, `lib/sanity`, revalidate route test) are listed as portable in the #4 audit; keep them.
- CI per #4 audit: lint, typecheck, test on Node 22. Add `playwright install` and the E2E job only if the owner wants it in CI at launch.

## 5. v1 ADR 0001-0014: carry forward or supersede

Source: `docs/adr/*.md` in https://github.com/mt-ch/mattchan.work (cloned to a temp dir, contents treated as data; none contained instructions). Verdicts reflect decisions already recorded on map #2 (#4 audit, #5, #6). Because the v2 repo has no ADRs yet, "carry forward" means: write a fresh, short v2 ADR (new number) that cites the v1 ADR, not copy files.

| v1 ADR | Verdict | Reason |
|---|---|---|
| 0001 Embedded Studio at `/studio` | **Carry forward** | Same single-editor, single-consumer, single-repo reasoning holds; #9 already specs "Next + embedded Sanity Studio". Re-check Studio under Cache Components in #9 (not verified, see section 1). |
| 0002 Single `production` dataset | **Carry forward, amended** | The principle (one dataset, one editor) still holds; #6 decided a brand-new dataset not shared with v1 and #7 is still open on coexistence/cutover. Write the v2 ADR with the new dataset name and say it is separate from v1's `production`. |
| 0003 On-demand ISR via webhook | **Carry forward, amended** | Decision (webhook-driven on-demand invalidation, not time-based or rebuild) holds. Mechanism likely changes from per-path `revalidatePath` to tag-based under Cache Components; paths in the route must also be fixed for v2 routes (#4 audit). |
| 0004 No preview mode | **Carry forward** | Sole editor, same rationale. Revisit only if the owner wants Draft Mode; Sanity's current App Router guide covers draft mode via `defineLive` (https://www.sanity.io/docs/visual-editing/visual-editing-with-next-js-app-router). |
| 0005 Chat drawer replaces command bar | **Do not carry** | Ask is dropped (#5). Historical only. |
| 0006 Repo structure | **Carry forward in reduced form** | Keep: `components/{ui,layout,features}` buckets with no loose files, `lib/sanity` as sole Sanity-client constructor, theme constants module, `app/(site)` route group so `/studio` gets no site chrome, and "assert behaviour, not markup" testing philosophy. Drop: `lib/assistant/**` and the transition parts (#5 says so explicitly). Split into a structure ADR and a testing ADR if desired. |
| 0007 Custom cursor interaction model | **Do not carry** | Cursor dropped (#5); #17 may reintroduce, in which case write a new ADR. |
| 0008 Page transition overlay | **Do not carry** | Overlay dropped (#5); v1 already marks it partially superseded by 0014. |
| 0009 Chat motion conventions | **Supersede (do not carry)** | Chat is gone. Reusable ideas (motion tokens as the single timing source; bounded one-library rule) should be restated in a new motion ADR only if #17 adds motion. |
| 0010 Experience = company with roles | **Supersede** | `experience` dropped from the schema (#6: "ADR 0010 no longer applies"). Note: #4's earlier audit verdict "holds" is overtaken by #6. Also remove Experience from the v2 glossary. |
| 0011 Chat grounding pre-generation gate | **Do not carry** | Ask-only. |
| 0012 Assistant markdown + project reference | **Do not carry** | Ask-only. |
| 0013 Ask temporarily disabled | **Do not carry** | Ask removed outright (#5), so the `ASK_ENABLED` flag and index-health build step are moot. |
| 0014 Motion system | **Do not carry (supersede with a v2 motion ADR if #17 adds motion)** | Lenis, scroll reveals and `next-view-transitions` push dropped (#5). Keep only the `environment.ts` idea and the "behaviour, not visuals" test rule if motion returns. React 19.3 `<ViewTransition>` replaces the third-party package (see section 3). |

Count: 4 carry (0001, 0002, 0003, 0004; two amended), 1 partial carry (0006), 9 not carried (0005, 0007, 0008, 0009, 0010, 0011, 0012, 0013, 0014).

## New ADR candidates for #9

These are choices made here that are worth recording once accepted (suggested, not mandated):
- Tailwind 4 CSS-first tokens, no Sass, `data-theme` variant.
- Cache Components and tag-based revalidation (amends v1 0003).
- Testing: Vitest 5 + RTL for units, Playwright for async server pages.

## Not verified / open

- Whether the embedded Sanity Studio route and `next-sanity` 13.x are fully compatible with `cacheComponents: true` on Next 16.4 (only indirect evidence: Sanity changelog title and peer ranges).
- TypeScript 7 compatibility with the wider toolchain (Sanity typegen, typescript-eslint, Vitest).
- Vitest 5 migration guide details beyond the blog's summary.
- Whether `ensureStatic` is stable in 16.4.3.
- Tailwind Labs/Shopify announcement impact (no primary source describing impact was read).
- Prettier plugin and `@vercel/analytics` / `@vercel/speed-insights` current versions were not checked; they are unchanged choices from v1.
- `@next/playwright` `instant()` details only read via the Next Playwright guide.

## Sources

- Next.js: https://nextjs.org/blog, https://nextjs.org/blog/next-16-4, https://nextjs.org/support-policy, https://github.com/vercel/next.js/releases/tag/v16.4.3, https://nextjs.org/docs/app/getting-started/caching, https://nextjs.org/docs/app/api-reference/functions/revalidatePath, https://nextjs.org/docs/app/getting-started/css, https://nextjs.org/docs/app/guides/view-transitions, https://nextjs.org/docs/app/guides/testing, https://nextjs.org/docs/app/guides/testing/vitest, https://nextjs.org/docs/app/guides/testing/playwright, https://nextjs.org/docs/app/api-reference/config/typescript, https://nextjs.org/docs/app/api-reference/config/eslint
- React: https://react.dev/blog/2026/09/09/react-19-3
- Tailwind: https://tailwindcss.com/blog, https://tailwindcss.com/docs/compatibility, https://tailwindcss.com/docs/theme, https://tailwindcss.com/docs/dark-mode
- Motion: https://motion.dev/docs/react-upgrade-guide, https://github.com/motiondivision/motion/blob/main/CHANGELOG.md
- GSAP: https://gsap.com/standard-license/
- Vitest: https://vitest.dev/blog/vitest-5
- Sanity: https://www.sanity.io/docs/visual-editing/visual-editing-with-next-js-app-router
- npm registry metadata (`npm view <pkg>`) for versions, dist-tags, engines and peer dependencies, queried 2026-10-23.
- v1 repo: https://github.com/mt-ch/mattchan.work (`package.json`, `vitest.config.ts`, `docs/adr/0001-0014`); issues #2, #4, #5, #7, #8, #9, #17 of mt-ch/mattchan.work-v2.
