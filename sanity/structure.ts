// Third-party libraries
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import type { StructureResolver } from "sanity/structure";

/**
 * The Studio's content tree: About as a singleton, then the Projects and
 * Playground piece lists. The Playground list is drag-and-drop orderable.
 *
 * @param S - The Studio's structure builder.
 * @param context - The Studio's config context, which the orderable list needs.
 * @returns The "Content" list.
 */
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("About")
        .id("about")
        .child(S.document().schemaType("about").documentId("about")),
      S.divider(),
      S.documentTypeListItem("project").title("Projects"),
      orderableDocumentListDeskItem({
        type: "playgroundPiece",
        title: "Playground",
        S,
        context,
      }),
    ]);
