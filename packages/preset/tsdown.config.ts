import { createTsdownConfig } from "../../tsdown.config.base.ts";

// `loadedBy: "node"` — this package is read by Panda's config loader, not by a Solid app, so it
// ships plain `.js` under the `import` condition. The repo default (`.jsx` under a `"solid"`-only
// condition) exists for the consumer's JSX compiler, and a Panda preset contains no JSX at all.
export default createTsdownConfig(import.meta.dirname, { loadedBy: "node" });
