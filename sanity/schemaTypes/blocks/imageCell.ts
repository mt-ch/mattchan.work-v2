// Third-party libraries
import { defineField, defineType } from "sanity";

export const imageCell = defineType({
  name: "imageCell",
  title: "Image",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      description:
        "Crops (object-cover) to a fixed 3:2 frame — your hotspot controls what stays in view.",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { media: "image", alt: "image.alt" },
    prepare({ media, alt }) {
      return { title: "Image", subtitle: alt, media };
    },
  },
});
