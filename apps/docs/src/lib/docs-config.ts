/**
 * The nav register — **a decision, not a filesystem artefact**.
 *
 * chakra-ui.com declares its whole information architecture in one tree
 * (`__reference-impl__/chakra-ui/apps/www/docs.config.ts`: section → group → page) and scopes the
 * left sidebar to the current section. This file is that tree for this site, with their group
 * titles and their order, and it is the specification the sidebar, the top bar and the
 * previous/next pager all read.
 *
 * **What this file does not do is assert that a page exists.** Existence is the content tree —
 * one `.mdx` under `src/content/<section>/[<group>/]<name>.mdx` — and an entry with no file does
 * not render (`decisions-ledger.md` **D-141**). That split is deliberate: the site is built one batch at
 * a time, so the settled IA can be written down in full now while the sidebar still shows only
 * what a reader can actually open. It also keeps this file from becoming a second inventory —
 * which component owes a page is `roadmap.md` §4, read mechanically by `check:docs-inventory`
 * (**D-140**).
 *
 * The component groups are Chakra's, applied to **our** folder names, which differ in a dozen
 * places (`radio-group` for their `radio`, `segment-group` for their `segmented-control`).
 * **An entry here needs a counterpart entry in chakra-ui.com's own nav** — a component the React
 * version documents inside another page is documented there too, and one it documents nowhere gets
 * no entry (`docs-site.md` §2.3). The three `input-*` rows are the open exception that section
 * names.
 */

/**
 * Where a page's `source` link points. chakra-ui.com keeps the same two values in its own
 * `docs.config.ts` and joins them in the content pipeline rather than in a page's frontmatter — so
 * frontmatter carries a path, one place carries the host, and moving branches is one edit.
 *
 * **The branch is the one these docs are built from**, which is `develop` and not `main` — a page
 * documents the component as this branch has it, and `main` is behind, so half the links would
 * 404 on the components it has not seen yet. Upstream's value is `main` for the same reason: it is
 * where their docs are built.
 */
export const repoUrl = "https://github.com/fabien-ml/chakra-ui-solid";
export const repoBranch = "develop";

export interface NavItem {
  title: string;
  /** The URL segment. Absent on a group that is a heading rather than a path segment. */
  url?: string;
  items?: NavItem[];
}

/**
 * The four sections of the top bar, in nav order: **Get Started · Components · Styling ·
 * Theming** (`docs-site.md` §2.1). No Docs/Showcase/Blog/Guides split — chakra-ui.com's primary
 * bar is a site-level nav over four content types, and this site has one. No Charts
 * (`roadmap.md` §5.7), no sponsor button, no version dropdown.
 */
export const docsNav: NavItem[] = [
  {
    title: "Get Started",
    url: "get-started",
    items: [
      {
        title: "Overview",
        items: [
          { title: "Installation", url: "installation" },
          { title: "Build setup", url: "build-setup" },
          { title: "Migration", url: "migration" },
        ],
      },
      {
        title: "Environments",
        url: "environments",
        items: [
          { title: "Shadow DOM", url: "shadow-dom" },
          { title: "Iframe", url: "iframe" },
        ],
      },
    ],
  },

  {
    title: "Components",
    url: "components",
    items: [
      {
        title: "Concepts",
        url: "concepts",
        items: [{ title: "Composition", url: "composition" }],
      },
      {
        title: "Layout",
        items: [
          { title: "Aspect Ratio", url: "aspect-ratio" },
          { title: "Bleed", url: "bleed" },
          { title: "Box", url: "box" },
          { title: "Center (Absolute)", url: "absolute-center" },
          { title: "Center", url: "center" },
          { title: "Circle", url: "circle" },
          { title: "Container", url: "container" },
          { title: "Flex", url: "flex" },
          { title: "Float", url: "float" },
          { title: "Grid", url: "grid" },
          { title: "Group", url: "group" },
          { title: "Scroll Area", url: "scroll-area" },
          { title: "Separator", url: "separator" },
          { title: "SimpleGrid", url: "simple-grid" },
          { title: "Spacer", url: "spacer" },
          { title: "Splitter", url: "splitter" },
          { title: "Square", url: "square" },
          { title: "Stack", url: "stack" },
          { title: "Sticky", url: "sticky" },
          { title: "Wrap", url: "wrap" },
        ],
      },
      {
        title: "Typography",
        items: [
          { title: "Blockquote", url: "blockquote" },
          { title: "Code", url: "code" },
          { title: "Code Block", url: "code-block" },
          { title: "Em", url: "em" },
          { title: "Heading", url: "heading" },
          { title: "Highlight", url: "highlight" },
          { title: "Kbd", url: "kbd" },
          { title: "Link", url: "link" },
          { title: "Link Overlay", url: "link-overlay" },
          { title: "List", url: "list" },
          { title: "Mark", url: "mark" },
          { title: "Quote", url: "quote" },
          { title: "Span", url: "span" },
          { title: "Strong", url: "strong" },
          { title: "Text", url: "text" },
        ],
      },
      {
        title: "Buttons",
        items: [
          { title: "Button", url: "button" },
          { title: "Close Button", url: "close-button" },
          { title: "Icon Button", url: "icon-button" },
          { title: "Download Trigger", url: "download-trigger" },
        ],
      },
      {
        title: "Date and Time",
        items: [{ title: "Date Picker", url: "date-picker" }],
      },
      {
        title: "Forms",
        items: [
          { title: "Checkbox", url: "checkbox" },
          { title: "Checkbox Card", url: "checkbox-card" },
          { title: "Color Picker", url: "color-picker" },
          { title: "Color Swatch", url: "color-swatch" },
          { title: "Editable", url: "editable" },
          { title: "Field", url: "field" },
          { title: "Fieldset", url: "fieldset" },
          { title: "File Upload", url: "file-upload" },
          { title: "Input", url: "input" },
          { title: "Number Input", url: "number-input" },
          { title: "Pin Input", url: "pin-input" },
          { title: "Radio Card", url: "radio-card" },
          { title: "Radio Group", url: "radio-group" },
          { title: "Rating Group", url: "rating-group" },
          { title: "Segment Group", url: "segment-group" },
          { title: "Select (Native)", url: "native-select" },
          { title: "Slider", url: "slider" },
          { title: "Switch", url: "switch" },
          { title: "Tags Input", url: "tags-input" },
          { title: "Textarea", url: "textarea" },
          { title: "Toggle", url: "toggle" },
        ],
      },
      {
        title: "Collections",
        items: [
          { title: "Combobox", url: "combobox" },
          { title: "Listbox", url: "listbox" },
          { title: "Select", url: "select" },
          { title: "Tree View", url: "tree-view" },
        ],
      },
      {
        title: "Overlays",
        items: [
          { title: "Action Bar", url: "action-bar" },
          { title: "Dialog", url: "dialog" },
          { title: "Drawer", url: "drawer" },
          { title: "Floating Panel", url: "floating-panel" },
          { title: "Hover Card", url: "hover-card" },
          { title: "Menu", url: "menu" },
          { title: "Popover", url: "popover" },
          { title: "Tooltip", url: "tooltip" },
        ],
      },
      {
        title: "Disclosure",
        items: [
          { title: "Accordion", url: "accordion" },
          { title: "Breadcrumb", url: "breadcrumb" },
          { title: "Carousel", url: "carousel" },
          { title: "Collapsible", url: "collapsible" },
          { title: "Pagination", url: "pagination" },
          { title: "Steps", url: "steps" },
          { title: "Tabs", url: "tabs" },
        ],
      },
      {
        title: "Feedback",
        items: [
          { title: "Alert", url: "alert" },
          { title: "Empty State", url: "empty-state" },
          { title: "Loader", url: "loader" },
          { title: "Progress Circle", url: "progress-circle" },
          { title: "Progress", url: "progress" },
          { title: "Skeleton", url: "skeleton" },
          { title: "Spinner", url: "spinner" },
          { title: "Status", url: "status" },
          { title: "Toast", url: "toast" },
        ],
      },
      {
        title: "Data Display",
        items: [
          { title: "Avatar", url: "avatar" },
          { title: "Badge", url: "badge" },
          { title: "Card", url: "card" },
          { title: "Clipboard", url: "clipboard" },
          { title: "Image", url: "image" },
          { title: "Data List", url: "data-list" },
          { title: "Icon", url: "icon" },
          { title: "Marquee", url: "marquee" },
          { title: "QR Code", url: "qr-code" },
          { title: "Stat", url: "stat" },
          { title: "Table", url: "table" },
          { title: "Tag", url: "tag" },
          { title: "Timeline", url: "timeline" },
        ],
      },
      {
        title: "Internationalization",
        items: [{ title: "Format", url: "format" }],
      },
      {
        title: "Utilities",
        items: [
          { title: "Checkmark", url: "checkmark" },
          { title: "ClientOnly", url: "client-only" },
          { title: "Focus Trap", url: "focus-trap" },
          { title: "Portal", url: "portal" },
          { title: "Presence", url: "presence" },
          { title: "Radiomark", url: "radiomark" },
          { title: "Skip Nav", url: "skip-nav" },
          { title: "Visually Hidden", url: "visually-hidden" },
        ],
      },
    ],
  },

  {
    title: "Styling",
    url: "styling",
    items: [
      {
        title: "Concepts",
        items: [
          { title: "Overview", url: "overview" },
          // Ours, with no upstream counterpart, and the loudest page on the site
          // (`docs-site.md` §2.3). Second, because the overview's first link is this page.
          { title: "Static Extraction", url: "static-extraction" },
          { title: "Chakra Factory", url: "chakra-factory" },
          { title: "Responsive Design", url: "responsive-design" },
          { title: "CSS Variables", url: "css-variables" },
          { title: "Dark Mode", url: "dark-mode" },
          { title: "Color Opacity Modifier", url: "color-opacity-modifier" },
          { title: "Conditional Styles", url: "conditional-styles" },
          { title: "Virtual Color", url: "virtual-color" },
          { title: "Cascade Layers", url: "cascade-layers" },
        ],
      },
      {
        title: "Compositions",
        items: [
          { title: "Text Styles", url: "text-styles" },
          { title: "Layer Styles", url: "layer-styles" },
          { title: "Animation Styles", url: "animation-styles" },
          { title: "Focus Ring", url: "focus-ring" },
        ],
      },
      {
        title: "Style Props",
        url: "style-props",
        items: [
          { title: "Background", url: "background" },
          { title: "Border", url: "border" },
          { title: "Display", url: "display" },
          { title: "Divide", url: "divide" },
          { title: "Effects", url: "effects" },
          { title: "Filters", url: "filters" },
          { title: "Flex and Grid", url: "flex-and-grid" },
          { title: "Interactivity", url: "interactivity" },
          { title: "Layout", url: "layout" },
          { title: "List", url: "list" },
          { title: "Sizing", url: "sizing" },
          { title: "Spacing", url: "spacing" },
          { title: "SVG", url: "svg" },
          { title: "Tables", url: "tables" },
          { title: "Transforms", url: "transforms" },
          { title: "Transitions", url: "transitions" },
          { title: "Typography", url: "typography" },
        ],
      },
    ],
  },

  {
    title: "Theming",
    url: "theming",
    items: [
      {
        title: "Concepts",
        items: [
          { title: "Overview", url: "overview" },
          { title: "Tokens", url: "tokens" },
          { title: "Semantic Tokens", url: "semantic-tokens" },
          { title: "Recipes", url: "recipes" },
          { title: "Slot Recipes", url: "slot-recipes" },
          // `defineChakraConfig` is ours and has no Chakra counterpart — their nearest thing is
          // `createSystem`, which a `panda codegen` run writes rather than a consumer calling it. It
          // sits in Theming rather than in a fifth `reference/` tier, which the top bar does not
          // have and `check:docs-inventory` rejects outright.
          { title: "defineChakraConfig", url: "chakra-config" },
          // The React version has no counterpart page: nesting two systems is a capability it has
          // and never wrote down, and the `prefix.className` requirement is only visible once two
          // sheets are on one document.
          { title: "Multiple Systems", url: "multiple-systems" },
        ],
      },
      {
        title: "Design Tokens",
        items: [
          { title: "Animations", url: "animations" },
          { title: "Aspect Ratios", url: "aspect-ratios" },
          { title: "Breakpoints", url: "breakpoints" },
          { title: "Colors", url: "colors" },
          { title: "Cursors", url: "cursors" },
          { title: "Radii", url: "radii" },
          { title: "Shadows", url: "shadows" },
          { title: "Sizes", url: "sizes" },
          { title: "Spacing", url: "spacing" },
          { title: "Typography", url: "typography" },
          { title: "Z-Index", url: "z-index" },
        ],
      },
      {
        title: "Compositions",
        items: [
          { title: "Text Styles", url: "text-styles" },
          { title: "Layer Styles", url: "layer-styles" },
        ],
      },
      {
        title: "Customization",
        url: "customization",
        items: [
          { title: "Overview", url: "overview" },
          { title: "Animations", url: "animations" },
          { title: "Breakpoints", url: "breakpoints" },
          { title: "Colors", url: "colors" },
          { title: "Conditions", url: "conditions" },
          { title: "CSS Variables", url: "css-variables" },
          { title: "Global CSS", url: "global-css" },
          { title: "Recipes", url: "recipes" },
          { title: "Sizes", url: "sizes" },
          { title: "Spacing", url: "spacing" },
          { title: "Utilities", url: "utilities" },
        ],
      },
    ],
  },
];
