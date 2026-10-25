"use client";

import { createContext, useContext, useState } from "react";

import {
  ProjectList,
  type ProjectListItem,
} from "@/components/features/projects/project-list";

type ActiveProject = { slug: string | undefined; setSlug: (s: string) => void };

const ActiveProjectContext = createContext<ActiveProject | null>(null);

/** Shares which Project is at the stream's centre with the sidebar list. */
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

export function useActiveProject() {
  const ctx = useContext(ActiveProjectContext);
  if (!ctx) throw new Error("Missing ActiveProjectProvider");
  return ctx;
}

export function ActiveProjectList({
  projects,
}: {
  projects: ProjectListItem[];
}) {
  const { slug } = useActiveProject();
  return <ProjectList projects={projects} activeSlug={slug} />;
}
