# Embed Sanity Studio in the Next.js app

Carried forward from v1 ADR 0001. Sanity Studio can be its own deployment or a route inside the consuming app. v2 embeds it at `/studio`: there is one editor, one content consumer, and one repo holding the schema, so a second deployment adds hosting and sync work with no isolation benefit. The trade-off is that Studio's admin UI ships in the same bundle and deploy as the public site, which is acceptable because the site has no separate release cadence to protect.

Open risk: compatibility of the embedded Studio route and `next-sanity` with Next's Cache Components was not verified (see `docs/research/v2-stack-choices.md`). Check it before enabling `cacheComponents`.
