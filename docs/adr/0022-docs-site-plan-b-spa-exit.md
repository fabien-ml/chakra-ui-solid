# Plan B for the docs site: a Vite SPA with `@solidjs/router`

The docs site is built on a Solid SSR meta-framework with full-document prerender ([0014](0014-docs-full-document-prerender.md)). If that framework fails us, the documented exit is a plain Vite SPA with `@solidjs/router`. It is an exit, not a default: it loses SSR and prerender, so prose leaves the HTML (search indexing, first paint), and the docs app stops being the one place outside the `ssr` test project where the published packages get server-rendered. `llms-full.txt` is unaffected because it is generated from MDX source ([0034](0034-llms-txt-generated-from-source.md)).

Any one trigger is sufficient:

| # | Trigger |
|---|---|
| B1 | The prerender-completeness check fails and the cause is inside the meta-framework, not our config |
| B2 | A framework or router release moves its `solid-js` peer off the 2.x range and no pinned pair satisfies both it and the pinned `solid-js` (install fails or resolves a second Solid) |
| B3 | The prerelease line stalls: two consecutive `solid-js` 2.0 bumps the framework does not follow, while the docs build is broken against the newer Solid |

The exit stays cheap only while the MDX pipeline, the Panda consumer config, the examples pipeline, the props-table generator and the route content stay independent of the framework; that is a standing constraint on how they are built.
