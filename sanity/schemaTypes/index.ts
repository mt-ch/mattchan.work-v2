// Third-party libraries
import type { SchemaTypeDefinition } from "sanity";

// Local modules
import { about } from "./about";
import { imageCell } from "./blocks/imageCell";
import { row } from "./blocks/row";
import { textCell } from "./blocks/textCell";
import { videoCell } from "./blocks/videoCell";
import { playgroundPiece } from "./playgroundPiece";
import { project } from "./project";
import { seo } from "./seo";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    about,
    project,
    playgroundPiece,
    seo,
    row,
    imageCell,
    videoCell,
    textCell,
  ],
};
