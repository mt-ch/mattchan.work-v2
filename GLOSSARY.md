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

**Row**:
A Content Block in a Project's story holding one or two cells side by side. Its number of cells always matches its column count.
_Avoid_: Section, band

**Cell**:
One item inside a Row: an image, a video or text. Rows may mix cell types freely.
_Avoid_: Tile, column

**Landing**:
The single-page overview at `/`, made of sections designed in Figma.

**Queue**:
The diagonal fan of uniform 4:5 cards on the Landing, one card per Playground piece in Sanity order, wrapping by modulo. Cards further from the focus card are smaller, fainter and angled.
_Avoid_: Tile (a Queue item is a card), carousel, stream

**Card**:
One item of the Queue: a Playground piece shown at 4:5 and linking to its Project. The card at the focus point is the focus card.
_Avoid_: Tile, Cell

**Playground piece**:
A single image or video shown in the Queue, with its orientation (portrait 4:5 or landscape 3:2) and the Project it belongs to. Its own document in Sanity, and the only source of Queue content. The Playground canvas it was first made for has been removed (see ADR 0011), but the document type keeps its name.
_Avoid_: Tile, Card (a card is how a piece appears in the Queue)

**Work page**:
A Project's detail page. Pertemps is the template.
