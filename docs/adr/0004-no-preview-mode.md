# No Draft Mode or Sanity preview

Carried forward from v1 ADR 0004. v2 leaves out Next.js Draft Mode and Sanity's draft perspective. As the sole editor, "publish, then check the live page" is cheap, while auth-gated preview routes and draft-aware queries are real setup for a benefit that mostly matters with several editors. This was deliberate, not an oversight. It can be added later through Sanity's App Router visual-editing guide if the workflow proves annoying.
