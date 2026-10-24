import { defineField, defineType } from "sanity";

function imageField(name: string, title: string, required: boolean) {
  return defineField({
    name,
    title,
    type: "image",
    description:
      "Crops (object-cover) to a fixed 3:2 frame — your hotspot controls what stays in view.",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Alt text",
        type: "string",
        validation: (rule) => rule.required(),
      }),
    ],
    validation: required ? (rule) => rule.required() : undefined,
  });
}

export const imageBlock = defineType({
  name: "imageBlock",
  title: "Image block",
  type: "object",
  fields: [
    imageField("image", "Image", true),
    imageField("secondImage", "Second image", false),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
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
      name: "mockup",
      title: "Phone mockup",
      description: "Render the tile as a phone-mockup tile.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Full", value: "full" },
          { title: "Pair", value: "pair" },
        ],
        layout: "radio",
      },
      initialValue: "full",
      validation: (rule) =>
        rule.required().custom((layout, context) => {
          const parent = context.parent as
            { secondImage?: unknown } | undefined;
          if (layout === "pair" && !parent?.secondImage) {
            return "Pair layout requires a second image.";
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: { media: "image", caption: "caption", layout: "layout" },
    prepare({ media, caption, layout }) {
      return {
        title: "Image block",
        subtitle: caption || layout,
        media,
      };
    },
  },
});
