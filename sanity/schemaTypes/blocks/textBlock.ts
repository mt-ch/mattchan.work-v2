import { defineField, defineType } from "sanity";

export const textBlock = defineType({
  name: "textBlock",
  title: "Text block",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: "block" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "background",
      title: "Background",
      description: "Provisional; the final set is decided in #14.",
      type: "string",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Muted", value: "muted" },
          { title: "Accent", value: "accent" },
        ],
        layout: "radio",
      },
      initialValue: "default",
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "One column", value: "one-column" },
          { title: "Two column — split", value: "two-column-split" },
          { title: "Two column — together, left", value: "two-column-left" },
          { title: "Two column — together, right", value: "two-column-right" },
        ],
        layout: "radio",
      },
      initialValue: "one-column",
    }),
  ],
  preview: {
    select: { content: "content" },
    prepare({ content }) {
      const firstBlock = (content ?? []).find(
        (block: { _type?: string }) => block._type === "block",
      );
      const text = (firstBlock?.children ?? [])
        .map((span: { text?: string }) => span.text ?? "")
        .join("");
      return { title: "Text block", subtitle: text || undefined };
    },
  },
});
