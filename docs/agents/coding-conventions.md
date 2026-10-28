# Coding Conventions

How code in this repo is written so it stays readable. Covers readability only; file layout is in `docs/adr/0005-repo-structure.md` and testing in `docs/adr/0006-testing-setup.md`. Prettier owns formatting.

## Doc comments

Every function gets a TSDoc comment: functions, helpers that aren't exported, React components and hooks. Tiny inline callbacks such as `.map((tile) => tile.slug)` are exempt.

- One-line description first.
- `@param name - description` for each parameter. No types in braces; TypeScript already has them.
- `@returns description`. Omit it when the function returns nothing.
- A component documents each prop as `@param props.name - description`.

```ts
/**
 * Wraps an offset into [0, setHeight) so repeated copies look identical.
 *
 * @param offset - Current scroll offset in px.
 * @param setHeight - Height of one copy of the tile set in px.
 * @returns The offset wrapped into one copy.
 */
export function wrapOffset(offset: number, setHeight: number): number {
  if (setHeight <= 0) return 0;

  return ((offset % setHeight) + setHeight) % setHeight;
}
```

## Imports

Group imports. Put a one-line comment above each group naming it and a blank line between groups. Type imports stay with the module they come from.

```ts
// React and Next.js
import Image from "next/image";
import { useEffect, useRef } from "react";

// Third-party libraries
import { gsap } from "gsap";

// Shared modules
import { urlFor } from "@/lib/sanity";

// Local modules
import { useActiveProject } from "./active-project";
import type { StreamTile } from "./stream-data";
```

Omit a group that has no imports.

## Function bodies

Break a body into steps. Separate steps with a blank line, and put a one-line comment above a step whose purpose isn't obvious from the code. Comments explain why or what the step is for, not a restatement of the line below.

```ts
function measure() {
  // Read the layout of one copy of the set
  const first = Array.from(track.children).slice(0, tiles.length);
  boxes = first.map(toBox);

  // Add copies until the stream always fills the viewport
  const needed = Math.ceil(viewportHeight / setHeight) + 2;
  setCopies((c) => Math.max(c, needed));
}
```

## Size

Keep chunks small. ESLint warns on the first two.

- A function body is at most 40 lines (blank lines and comments excluded). Split a longer one into named functions.
- A file is at most 200 lines with one main export. Small helpers can sit beside it. Split a larger file by responsibility.
- JSX has no line limit. Extract a block into its own component when it has a name or purpose of its own.
