# `For` and `Show` are not ported

Chakra's `For` is `each?.map(children)` with a `fallback`, and `Show` is `when` plus `fallback` plus callback children. Solid's own `<For>` and `<Show>` have the same API (`<For>` with reference-keyed reconciliation, which `.map()` in Solid JSX destroys; `<Show>` with a narrowed accessor). A port would be a second name for a primitive the reader already imports, or a reimplemented `.map`, which is the anti-pattern `<For>` exists to prevent. The only delta is that Solid's `index` is an accessor, not a number.

The migration page maps `For` and `Show` to `solid-js`'s own ([0036](0036-migration-page-delta-table.md)); the mapping is the deliverable, not a component page.

Exclusions are only `for`, `show` and charts (a dependency ground, not a style one). Everything else ships, including `portal` (cut to a few lines because Solid's own `Portal` throws during SSR; `disabled` is not shipped) and `client-only` ([0003](0003-client-only-uses-onmount.md)); `environment` and `locale` are relocated to contexts ([0027](0027-environment-locale-in-core.md)). A "React idiom" is not by itself a reason to exclude.
