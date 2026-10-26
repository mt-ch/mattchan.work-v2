import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faAt, faFile } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faSquareLinkedin } from "@fortawesome/free-brands-svg-icons";

export type SiteLink = { label: string; href: string; icon: IconProp };

export function toSiteLinks(about: {
  email: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  resumeUrl: string | null;
}): SiteLink[] {
  const links: SiteLink[] = [];
  if (about.email) {
    links.push({ label: "Email", href: `mailto:${about.email}`, icon: faAt });
  }
  if (about.linkedinUrl) {
    links.push({
      label: "LinkedIn",
      href: about.linkedinUrl,
      icon: faSquareLinkedin,
    });
  }
  if (about.githubUrl) {
    links.push({ label: "GitHub", href: about.githubUrl, icon: faGithub });
  }
  if (about.resumeUrl) {
    links.push({ label: "Resume", href: about.resumeUrl, icon: faFile });
  }
  return links;
}
