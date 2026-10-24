import { siteLinks } from "./site-links";

const paths: Record<(typeof siteLinks)[number]["label"], string> = {
  Email: "M4 6h16v12H4zM4 7l8 6 8-6",
  LinkedIn: "M5 9v10M5 5v1M10 19V9m0 4c0-3 6-4 6 0v6",
  GitHub:
    "M9 19c-4 1-4-2-6-2m12 4v-3c0-1 0-2-1-3 3 0 6-2 6-5 0-1 0-2-1-3 0-1 0-2-1-3 0 0-2 0-3 1a8 8 0 0 0-6 0C8 3 6 3 6 3 5 4 5 5 5 6 4 7 4 8 4 9c0 3 3 5 6 5-1 1-1 2-1 3v3",
  Résumé: "M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5",
};

export function IconButtonRow() {
  return (
    <ul className="flex gap-xs">
      {siteLinks.map(({ label, href }) => (
        <li key={label}>
          <a
            href={href}
            aria-label={label}
            className="flex size-10 items-center justify-center bg-surface hover:bg-inverse-background hover:text-inverse-foreground"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d={paths[label]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
