// Third-party libraries
import { defineField, defineType } from "sanity";

export const disciplines = ["Branding", "Design", "Development", "AI"];

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  groups: [{ name: "seo", title: "SEO" }],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "discipline",
      title: "Discipline",
      description: 'Joined with " + " in the UI.',
      type: "array",
      of: [{ type: "string" }],
      options: { list: disciplines },
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      description: "Mobile carousel slide, Next Up thumbnail and OG fallback.",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverVideo",
      title: "Cover video",
      description:
        "Optional. Plays muted and looping in the Landing tile; the cover image stays as the poster and fallback.",
      type: "file",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "story",
      title: "Project story",
      description:
        "Reorderable case-study narrative, composed of Content Blocks.",
      type: "array",
      of: [{ type: "textBlock" }, { type: "imageBlock" }],
    }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      of: [
        {
          type: "object",
          name: "link",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (rule) => rule.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dateCompleted",
      title: "Date completed",
      type: "date",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "summary", media: "coverImage" },
  },
});
