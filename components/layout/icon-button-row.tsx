// Third-party libraries
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Shared modules
import type { SiteLink } from "@/components/layout/site-links";

/**
 * A row of icon-only link buttons, equal width across the row.
 *
 * @param props.links - The links to show, each with a label, URL and icon.
 * @returns The button row; the label is exposed as `aria-label`.
 */
export function IconButtonRow({ links }: { links: SiteLink[] }) {
  return (
    <ul className="flex flex-row items-center justify-between gap-2xs">
      {links.map(({ label, href, icon }) => (
        <li key={label} className="w-full">
          <a
            href={href}
            aria-label={label}
            className="flex w-full items-center justify-center rounded-md bg-surface p-sm hover:bg-inverse-background hover:text-inverse-foreground"
          >
            <FontAwesomeIcon
              icon={icon}
              className="size-[calc(var(--space-sm)*1.2)]"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
