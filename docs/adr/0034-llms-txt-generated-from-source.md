# `llms.txt` and `llms-full.txt` are generated from the MDX source

They are generated from the source of record (the MDX), not scraped from rendered HTML. Scraping inherits every rendering artifact and drifts silently from the pages it summarises. Generating from source keeps code fences as fences, does not depend on prerender, and survives the SPA fallback ([0022](0022-docs-site-plan-b-spa-exit.md)).

It also carries the dynamic-value contract ([0026](0026-dynamic-value-routes.md)) to assistants, who would otherwise write runtime-value code that silently renders unstyled.
