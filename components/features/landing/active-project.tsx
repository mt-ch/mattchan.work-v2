"use client";

// React and Next.js
import { createContext, useContext, useState } from "react";

// Shared modules
import {
  ProjectList,
  type ProjectListItem,
} from "@/components/features/projects/project-list";

type ActiveProject = { slug: string | undefined; setSlug: (s: string) => void };

const ActiveProjectContext = createContext<ActiveProject | null>(null);

/**
 * Shares which Project is at the stream's centre with the sidebar list.
 *
 * @param props.initialSlug - Slug of the Project active before any scrolling.
 * @param props.children - Everything that reads or sets the active Project.
 * @returns The context provider wrapping `children`.
 */
export function ActiveProjectProvider({
  initialSlug,
  children,
}: {
  initialSlug?: string;
  children: React.ReactNode;
}) {
  const [slug, setSlug] = useState(initialSlug);

  return (
    <ActiveProjectContext value={{ slug, setSlug }}>
      {children}
    </ActiveProjectContext>
  );
}

/**
 * Reads the active Project. Must be used inside `ActiveProjectProvider`.
 *
 * @returns The active slug and a setter for it.
 */
export function useActiveProject() {
  const ctx = useContext(ActiveProjectContext);
  if (!ctx) throw new Error("Missing ActiveProjectProvider");

  return ctx;
}

/**
 * The sidebar Project list with the active Project highlighted.
 *
 * @param props.projects - The Projects to list.
 * @returns The Project list.
 */
export function ActiveProjectList({
  projects,
}: {
  projects: ProjectListItem[];
}) {
  const { slug } = useActiveProject();

  return <ProjectList projects={projects} activeSlug={slug} />;
}
