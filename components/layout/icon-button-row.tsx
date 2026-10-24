import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAt, faFile } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faSquareLinkedin } from "@fortawesome/free-brands-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

const siteLinks: { label: string; href: string; icon: IconProp }[] = [
  {
    label: "Email",
    href: "mailto:hello@example.com",
    icon: faAt,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mattchan-uk",
    icon: faSquareLinkedin,
  },
  {
    label: "GitHub",
    href: "https://github.com/mt-ch",
    icon: faGithub,
  },
  {
    label: "Resume",
    href: "/resume.pdf",
    icon: faFile,
  },
];

export function IconButtonRow() {
  return (
    <ul className="gap-2xs flex flex-row items-center justify-between">
      {siteLinks.map(({ label, href, icon }) => (
        <li key={label} className="w-full">
          <a
            href={href}
            aria-label={label}
            className="bg-surface hover:bg-inverse-background hover:text-inverse-foreground p-sm flex w-full items-center justify-center rounded-md"
          >
            <FontAwesomeIcon icon={icon} className="size-4.5" />
          </a>
        </li>
      ))}
    </ul>
  );
}
