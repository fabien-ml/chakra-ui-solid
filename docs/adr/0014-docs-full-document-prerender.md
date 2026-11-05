# The docs site prerenders full documents, not an SPA shell

Every route is server-rendered into static HTML at build time, with link crawling, so the prose is in the HTML. SPA-mode prerendering emits a client-hydrated shell, which would drop the page's content from search indexing and from slow connections, and, specific to us, would stop the site being evidence that our packages server-render at all.

The built output is standalone: every route has an `index.html` carrying its rendered `<h1>` and paragraphs, and the client output directory serves from a plain static file server with no request outside itself. See [0022](0022-docs-site-plan-b-spa-exit.md) for the fallback if this breaks.
