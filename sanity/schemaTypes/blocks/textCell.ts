import { defineField, defineType } from "sanity";

export const textCell = defineType({
  name: "textCell",
  title: "Text",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      description:
        "Optional. Headings become the section nav on the Work page.",
      type: "string",
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: "block" }],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { heading: "heading", content: "content" },
    prepare({ heading, content }) {
      const firstBlock = (content ?? []).find(
        (block: { _type?: string }) => block._type === "block",
      );
      const text = (firstBlock?.children ?? [])
        .map((span: { text?: string }) => span.text ?? "")
        .join("");
      return { title: heading || "Text", subtitle: text || undefined };
    },
  },
});
