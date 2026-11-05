# Docs examples: fixed substitutions for what Solid lacks

Upstream examples are copied 1:1 ([0009](0009-docs-content-1-to-1-with-upstream.md)) except for these substitutions:

| Upstream | Here |
|---|---|
| `asChild` | `render` ([0059](0059-render-prop-over-as-child.md)) |
| `react-icons` (`Lu*` icons) | the docs app's own lucide glyph set |
| `react-lorem-ipsum` | the site's own equivalent |
| `react-hook-form` + `zod` examples | a signal and a plain `<form>`, same visible behaviour; headings become *Form Validation* / *Group Validation* |
| The Explorer (www-only machinery) | dropped: the slot is skipped, since this site has no Explorer page |

An example that nests a provider inside a root (upstream's `RootProvider` wrapping a `Root`, starting two machines and labelling two inputs) is simplified to the one machine it intended.
