// Third-party libraries
import type { StructureResolver } from "sanity/structure";

/**
 * The Studio's content tree: About as a singleton, then the Projects list.
 *
 * @param S - The Studio's structure builder.
 * @returns The "Content" list.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("About")
        .id("about")
        .child(S.document().schemaType("about").documentId("about")),
      S.divider(),
      S.documentTypeListItem("project").title("Projects"),
    ]);
