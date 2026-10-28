// Third-party libraries
import type { SchemaTypeDefinition } from "sanity";

// Local modules
import { about } from "./about";
import { imageBlock } from "./blocks/imageBlock";
import { textBlock } from "./blocks/textBlock";
import { project } from "./project";
import { seo } from "./seo";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [about, project, seo, textBlock, imageBlock],
};
