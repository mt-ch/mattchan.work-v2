import { defineField, defineType } from "sanity";

export const videoCell = defineType({
  name: "videoCell",
  title: "Video",
  type: "object",
  fields: [
    defineField({
      name: "video",
      title: "Video",
      description: "Plays muted and looping while on screen.",
      type: "file",
      options: { accept: "video/*" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "poster",
      title: "Poster",
      description:
        "Shown before playback and for visitors who prefer reduced motion. Crops to a fixed 3:2 frame.",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      description: "Accessible name for the video.",
      type: "string",
    }),
  ],
  preview: {
    select: { media: "poster", label: "label" },
    prepare({ media, label }) {
      return { title: "Video", subtitle: label, media };
    },
  },
});
