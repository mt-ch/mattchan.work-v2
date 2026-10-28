// Third-party libraries
import type { SchemaTypeDefinition } from "sanity";

// Local modules
import { about } from "./about";
import { imageCell } from "./blocks/imageCell";
import { row } from "./blocks/row";
import { textCell } from "./blocks/textCell";
import { videoCell } from "./blocks/videoCell";
import { project } from "./project";
import { seo } from "./seo";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [about, project, seo, row, imageCell, videoCell, textCell],
};
