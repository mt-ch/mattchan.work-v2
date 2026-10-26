import { defineQuery } from "groq";

// Image projections inline `asset->metadata { lqip, dimensions }` per query
// rather than via a shared fragment: `sanity typegen` only resolves the
// projection when it appears literally inside `defineQuery`.

export const projectsQuery = defineQuery(`
  *[_type == "project"] | order(order asc) {
    _id,
    _updatedAt,
    title,
    slug,
    summary,
    discipline,
    dateCompleted,
    coverImage {
      ...,
      "metadata": asset->metadata { lqip, dimensions }
    },
    "coverVideoUrl": coverVideo.asset->url,
    order,
    seo { noIndex }
  }
`);

export const otherProjectsQuery = defineQuery(`
  *[_type == "project" && _id != $currentId] | order(order asc) [0...2] {
    _id,
    title,
    slug,
    discipline,
    coverImage {
      ...,
      "metadata": asset->metadata { lqip, dimensions }
    },
    order
  }
`);

export const projectBySlugQuery = defineQuery(`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    summary,
    discipline,
    dateCompleted,
    links,
    order,
    coverImage {
      ...,
      "metadata": asset->metadata { lqip, dimensions }
    },
    story[] {
      _key,
      columns,
      items[] {
        ...,
        _type == "imageCell" => {
          image {
            ...,
            "metadata": asset->metadata { lqip, dimensions }
          }
        },
        _type == "videoCell" => {
          "videoUrl": video.asset->url,
          poster {
            ...,
            "metadata": asset->metadata { lqip, dimensions }
          }
        }
      }
    },
    seo {
      metaTitle,
      metaDescription,
      ogImage,
      ogImageAlt,
      noIndex
    }
  }
`);

export const projectSlugsQuery = defineQuery(`
  *[_type == "project" && defined(slug.current)].slug.current
`);

export const aboutQuery = defineQuery(`
  *[_type == "about"][0] {
    _id,
    _updatedAt,
    name,
    headline,
    bio,
    availability {
      status,
      isAvailable
    },
    "resumeUrl": resumeFile.asset->url,
    email,
    githubUrl,
    linkedinUrl,
    seo {
      metaTitle,
      metaDescription,
      ogImage,
      ogImageAlt,
      noIndex
    },
    siteName,
    titleTemplate,
    defaultMetaDescription,
    defaultOgImage
  }
`);
