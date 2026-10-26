"use client";

import { useEffect, useState } from "react";

export type NavSection = { id: string; label: string };

const INTRO_ID = "introduction";
// Distance from viewport top at which a heading counts as "scrolled past".
const ACTIVATE_OFFSET = 120;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function SectionNav({ sections }: { sections: NavSection[] }) {
  const [activeId, setActiveId] = useState(INTRO_ID);

  useEffect(() => {
    function update() {
      let current = INTRO_ID;
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= ACTIVATE_OFFSET) {
          current = id;
        }
      }
      setActiveId(current);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  function go(id: string) {
    const behavior: ScrollBehavior = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
      ? "auto"
      : "smooth";
    if (id === INTRO_ID) {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior });
  }

  const entries: NavSection[] = [
    { id: INTRO_ID, label: "Introduction" },
    ...sections,
  ];

  return (
    <nav aria-label="Sections" className="hidden lg:block">
      <ol className="gap-2xs flex flex-col">
        {entries.map((entry, i) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => go(entry.id)}
              aria-current={entry.id === activeId ? "true" : undefined}
              className={`text-small flex cursor-pointer gap-2 text-left transition-opacity ${
                entry.id === activeId
                  ? "text-foreground"
                  : "text-foreground/50 hover:text-foreground"
              }`}
            >
              <span>{pad(i)}</span>
              <span>{entry.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
