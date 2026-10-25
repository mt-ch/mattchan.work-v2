import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { SiteLink } from "@/components/features/landing/sidebar-data";

export function IconButtonRow({ links }: { links: SiteLink[] }) {
  return (
    <ul className="gap-2xs flex flex-row items-center justify-between">
      {links.map(({ label, href, icon }) => (
        <li key={label} className="w-full">
          <a
            href={href}
            aria-label={label}
            className="bg-surface hover:bg-inverse-background hover:text-inverse-foreground p-sm flex w-full items-center justify-center rounded-md"
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
