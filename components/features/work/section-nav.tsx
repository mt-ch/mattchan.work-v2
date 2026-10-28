"use client";

// React and Next.js
import { useEffect, useState } from "react";

// Shared modules
import { prefersReducedMotion } from "@/lib/motion/environment";

export type NavSection = { id: string; label: string };

const INTRO_ID = "introduction";
// Distance from viewport top at which a heading counts as "scrolled past".
const ACTIVATE_OFFSET = 120;

/**
 * Zero-pads a number to two digits.
 *
 * @param n - The number to pad.
 * @returns The number as a string of at least two digits.
 */
function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Finds the last section whose heading has scrolled past the activation line.
 *
 * @param sections - The sections to check, in page order.
 * @returns The ID of that section, or the introduction's ID if none has.
 */
function findActiveId(sections: NavSection[]) {
  let current = INTRO_ID;

  for (const { id } of sections) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= ACTIVATE_OFFSET) {
      current = id;
    }
  }

  return current;
}

/**
 * Tracks which section is active as the page scrolls or resizes.
 *
 * @param sections - The sections to track, in page order.
 * @returns The ID of the active section.
 */
function useActiveSection(sections: NavSection[]) {
  const [activeId, setActiveId] = useState(INTRO_ID);

  useEffect(() => {
    const update = () => setActiveId(findActiveId(sections));

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  return activeId;
}

/**
 * Scrolls to a section, or to the top for the introduction. Smooth unless the
 * visitor prefers reduced motion.
 *
 * @param id - The ID of the section to scroll to.
 */
function scrollToSection(id: string) {
  const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";

  if (id === INTRO_ID) {
    window.scrollTo({ top: 0, behavior });
    return;
  }

  document.getElementById(id)?.scrollIntoView({ behavior });
}

/**
 * Numbered section navigation for a Work page, hidden below the `lg`
 * breakpoint. The first entry is always the introduction.
 *
 * @param props.sections - The page's headed sections, in order.
 * @returns The nav, with the active section marked `aria-current`.
 */
export function SectionNav({ sections }: { sections: NavSection[] }) {
  const activeId = useActiveSection(sections);
  const entries: NavSection[] = [
    { id: INTRO_ID, label: "Introduction" },
    ...sections,
  ];

  return (
    <nav aria-label="Sections" className="hidden lg:block">
      <ol className="flex flex-col gap-2xs">
        {entries.map((entry, i) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => scrollToSection(entry.id)}
              aria-current={entry.id === activeId ? "true" : undefined}
              className={`flex cursor-pointer gap-2 text-left text-small transition-opacity ${
                entry.id === activeId
                  ? "text-foreground"
                  : "text-foreground/50 hover:text-foreground"
              }`}
            >
              <span className="text-muted">{pad(i)}</span>
              <span className="font-light text-foreground">{entry.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
