# Claims the docs must never make

Each of these is false, would be believed, and fails without an error message.

| Never claim | Because |
|---|---|
| Panda is optional, or a non-Panda consumer tier exists ("CSS variables only", "default theme only") | No `.css` is published from any package ([0067](0067-zero-published-css.md)); without Panda every component renders unstyled and nothing says why |
| A prebuilt stylesheet exists, or name a published `.css` entry point | Rejected and removed, not deferred |
| `createSystem` works, or theming happens at runtime | Theming is build-time `panda.config.ts` only. The migration page states this in its delta table ([0036](0036-migration-page-delta-table.md)) |
| A style prop or `css` prop accepts a runtime value | It accepts what Panda can evaluate at the call site; anything else uses another route ([0026](0026-dynamic-value-routes.md)) |
| `asChild` is supported (but never say `as` is missing) | Polymorphism is `as` and `render` on every part ([0059](0059-render-prop-over-as-child.md)) |
| A consumer can run our style-contract lint rule | It runs on this repo's source. A consumer's mistakes are caught by their own Panda run and computed-style assertions. The page may say the rule exists and what it enforces |
| `hideMode: "activity"` exists | No Solid equivalent ([0041](0041-no-hide-mode-activity.md)); documenting it describes a prop that type-errors |
| `Portal` takes `disabled` | Not shipped, so passing it is a type error rather than a silent no-op |
| A class-name check proves a style applied | `classList.contains("p_4")` passes on an unstyled element. Any "did it work?" step reads a computed style |

A check greps the content tier for the string forms (`asChild`, `createSystem`, `styles.css`, a `.css` import, `classList.contains` in a snippet). It catches strings, not claims: a page can pass it and still be wrong, so the list is a review contract with a tripwire. Two paths are allowed to name these terms because they exist to discuss them: the migration page (as the thing absent) and the static-extraction page (a class-name assertion as the thing not to write).
