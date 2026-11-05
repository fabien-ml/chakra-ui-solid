# The docs deploy to Cloudflare Pages on the default `pages.dev` subdomain

The Pages project is named `chakra-ui-solid`, giving `chakra-ui-solid.pages.dev`. Project names are first-come, so naming it is the first setup step. No custom domain is bought: a custom domain is a swap, not a migration, and a `*.pages.dev` URL is itself a mild "unofficial project" signal that works in the right direction ([0002](0002-branding-and-trademark.md)).

- Deploy the client build output only, as static assets: no Workers runtime, no server functions, no redirects beyond mapping 404 to the prerendered not-found page.
- Preview deploys on pull requests, production on the release branch. The smoke test runs against the preview URL, so closing the gate needs no production deploy.
