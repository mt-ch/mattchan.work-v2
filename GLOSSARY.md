# mattchan.work v2

A recruiter/client-facing professional portfolio showcasing projects and background. Not a blog or writing platform. A reskin of v1 with a new frontend, Figma-designed visuals and a trimmed Sanity schema (see `docs/adr/`).

## Language

**Project**:
A showcased body of work with its own detail page (the Work page), covering what was built, the role played, and technologies used. Carries a `discipline` (string[]).
_Avoid_: Case study, work sample

**Featured Project**:
A Project flagged to appear on the Landing page, as distinct from Projects that only appear in the full listing.
_Avoid_: Highlighted project, pinned project

**About**:
The singleton record holding site-owner profile information, including `availability`. Exactly one instance ever exists.
_Avoid_: Bio, profile

**Content Block**:
A single item in an ordered, editable block array (for example a Project's story). Section navigation on a Work page is derived from block headings.
_Avoid_: Section, module

**Landing**:
The single-page overview at `/`, made of sections designed in Figma.

**Work page**:
A Project's detail page. Pertemps is the template.
