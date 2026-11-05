# Docs nav: the register decides order, the content glob decides existence

Navigation order and grouping live in one declared tree in the docs app (section, group, page), mirroring Chakra's own docs config, including its twelve component groups (Layout, Typography, Buttons, Date and Time, Forms, Collections, Overlays, Disclosure, Feedback, Data Display, Internationalization, Utilities) rather than an alphabetical list. A site map joins the register to the content glob.

- **An entry with no `.mdx` file does not render**, so the whole settled structure is written down while the sidebar shows only what a reader can open.
- **A content file with no register entry renders under a visible "Ungrouped" heading** rather than vanishing: an unreachable page is the worse failure, and this one shows on the page.
- The sidebar renders the current top-level section's groups only.

## Considered options

- **Derive groups from the directory structure.** Rejected: a directory is a storage decision and a nav group an editorial one; they only coincide by accident, and it would mean 111 directories.
- **Declare only existing pages.** Rejected: the settled structure would live nowhere in code.
- **Alphabetise components.** Rejected: 111 alphabetical entries is a list to scan; Chakra's groups are a list to navigate.
