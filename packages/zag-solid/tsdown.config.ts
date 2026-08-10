import { createTsdownConfig } from "../../tsdown.config.base.ts";

// Entries come from `package.json#chakraUiSolid.entries`; everything else — the externals, the
// JSX-preserve transform, and the pinned `comments.legal` that keeps the seven `@license` headers
// alive in `dist/` — is the shared base config (`plan.md` §8; `CLAUDE.md` obligation 5).
export default createTsdownConfig(import.meta.dirname);
