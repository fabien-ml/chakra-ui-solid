# Docs pages carry YAML frontmatter and no body H1

A page's `title`, `description` and `links` are real YAML frontmatter, parsed (remark-frontmatter + remark-mdx-frontmatter) into a module export that the page header renders. There is no `# H1` in the body, because the header renders the title. A `links` value that is a URL renders as an anchor; anything else renders as plain text. `links` has to be structured data or it degrades into body prose.

Chakra's frontmatter has a `storybook` link; ours does not, since we ship no public Storybook ([0062](0062-storybook-local-playground-only.md)).
