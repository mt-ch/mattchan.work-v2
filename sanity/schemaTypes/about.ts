// Third-party libraries
import { defineField, defineType } from "sanity";

export const about = defineType({
  name: "about",
  title: "About",
  type: "document",
  groups: [
    {
      name: "seo",
      title: "SEO",
    },
    {
      name: "seoDefaults",
      title: "Site SEO Defaults",
    },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "availability",
      title: "Availability",
      description: "Shown in the Landing sidebar.",
      type: "object",
      fields: [
        defineField({
          name: "status",
          title: "Status text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "isAvailable",
          title: "Available",
          description: "Turns the green dot on.",
          type: "boolean",
          initialValue: false,
        }),
      ],
    }),
    defineField({
      name: "resumeFile",
      title: "Resume file",
      type: "file",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "githubUrl",
      title: "GitHub URL",
      type: "url",
    }),
    defineField({
      name: "linkedinUrl",
      title: "LinkedIn URL",
      type: "url",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      description:
        "Per-page SEO for the homepage (/). Blank fields fall back to the Site SEO Defaults below.",
      type: "seo",
      group: "seo",
    }),
    defineField({
      name: "siteName",
      title: "Site name",
      description:
        "Brand name used across social-share cards and as the default browser tab title.",
      type: "string",
      group: "seoDefaults",
    }),
    defineField({
      name: "titleTemplate",
      title: "Title template",
      description:
        'Applied to every page-level title. Use %s as the page title placeholder, e.g. "%s | Matt Chan".',
      type: "string",
      group: "seoDefaults",
    }),
    defineField({
      name: "defaultMetaDescription",
      title: "Default meta description",
      description: "Used for pages that do not set their own meta description.",
      type: "text",
      rows: 3,
      group: "seoDefaults",
    }),
    defineField({
      name: "defaultOgImage",
      title: "Default social image",
      description:
        "Fallback Open Graph / Twitter card image. Served at 1200x630.",
      type: "image",
      group: "seoDefaults",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "headline",
    },
  },
});
