// Third-party libraries
import { defineCliConfig } from "sanity/cli";

// Local modules
import { dataset, projectId } from "./sanity/env";

export default defineCliConfig({ api: { projectId, dataset } });
