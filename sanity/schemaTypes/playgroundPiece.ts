// Third-party libraries
import { defineField, defineType } from "sanity";

export const playgroundPiece = defineType({
  name: "playgroundPiece",
  title: "Playground piece",
  type: "document",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      description:
        "The tile image, and the poster when a video is attached. The hotspot sets what stays in view when it is cropped.",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "video",
      title: "Video",
      description:
        "Optional. Plays muted and looping over the image, which stays as the poster.",
      type: "file",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "orientation",
      title: "Orientation",
      description: "The tile shape: portrait is 4:5, landscape is 3:2.",
      type: "string",
      options: {
        list: [
          { title: "Portrait (4:5)", value: "portrait" },
          { title: "Landscape (3:2)", value: "landscape" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "project",
      title: "Project",
      description:
        "The Project this piece belongs to. Its title labels the tile and the tile links to it.",
      type: "reference",
      to: [{ type: "project" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      description: "Optional. Not shown on the canvas yet.",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      media: "image",
      project: "project.title",
      orientation: "orientation",
    },
    prepare({ media, project, orientation }) {
      return {
        title: project ?? "No Project",
        subtitle: orientation,
        media,
      };
    },
  },
});
