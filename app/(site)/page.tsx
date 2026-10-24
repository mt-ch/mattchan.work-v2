import { Availability } from "@/components/ui/availability";
import {
  ProjectList,
  type ProjectListItem,
} from "@/components/features/projects/project-list";
import { SiteShell } from "@/components/layout/site-shell";

// TODO(#12): replace with Featured Projects and About from Sanity.
const projects: ProjectListItem[] = [
  {
    slug: "the-home-hospital",
    name: "The Home Hospital",
    year: 2026,
    discipline: ["Branding", "Development"],
  },
  {
    slug: "matt-chan-work",
    name: "Matt Chan Work",
    year: 2026,
    discipline: ["Design", "Development"],
  },
  {
    slug: "pertemps",
    name: "Pertemps",
    year: 2024,
    discipline: ["Development"],
  },
  {
    slug: "ise-partners",
    name: "ISE Partners",
    year: 2023,
    discipline: ["Development"],
  },
  {
    slug: "mother-goods",
    name: "Mother Goods",
    year: 2022,
    discipline: ["Development"],
  },
];

export default function HomePage() {
  return (
    <SiteShell
      middle={
        <div className="hidden md:block">
          <ProjectList projects={projects} />
        </div>
      }
      bottom={
        <>
          <p className="text-caption font-mono">
            Frontend engineer based in the United Kingdom. Specialising in
            building scalable, product-focused applications since 2020.
          </p>
          <Availability>
            Available for collaborations or full time roles.
          </Availability>
        </>
      }
    >
      {/* TODO(#13): Landing sections. */}
      {null}
    </SiteShell>
  );
}
