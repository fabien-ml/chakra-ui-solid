import type { RecipeShape } from "./index";

/**
 * The 19 atomic recipes — `button`, `input`, `heading`, … — `container` among them. What a row
 * means, and why these are typed out rather than read off the loaded preset, is in `./index.ts`.
 *
 * `container` is the one key upstream's generator strips, since Panda ships a `container` pattern
 * of its own; `chakra/recipes/index.ts` registers our reproduction of Chakra's body in the same
 * table as the other 18, and it holds the same last position here.
 */
export const recipeContract = {
  badge: {
    className: "badge",
    slots: [],
    variants: {
      variant: ["solid", "subtle", "outline", "surface", "plain"],
      size: ["xs", "sm", "md", "lg"],
    },
    defaultVariants: { variant: "subtle", size: "sm" },
  },
  button: {
    className: "button",
    slots: [],
    variants: {
      size: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
      variant: ["solid", "subtle", "surface", "outline", "ghost", "plain"],
    },
    defaultVariants: { size: "md", variant: "solid" },
  },
  code: {
    className: "code",
    slots: [],
    variants: {
      variant: ["solid", "subtle", "outline", "surface", "plain"],
      size: ["xs", "sm", "md", "lg"],
    },
    defaultVariants: { variant: "subtle", size: "sm" },
  },
  heading: {
    className: "heading",
    slots: [],
    variants: {
      size: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"],
    },
    defaultVariants: { size: "xl" },
  },
  input: {
    className: "input",
    slots: [],
    variants: {
      size: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
      variant: ["outline", "subtle", "flushed"],
    },
    defaultVariants: { size: "md", variant: "outline" },
  },
  inputAddon: {
    className: "input-addon",
    slots: [],
    variants: {
      size: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
      variant: ["outline", "subtle", "flushed"],
    },
    defaultVariants: { size: "md", variant: "outline" },
  },
  kbd: {
    className: "kbd",
    slots: [],
    variants: {
      variant: ["raised", "outline", "subtle", "plain"],
      size: ["sm", "md", "lg"],
    },
    defaultVariants: { size: "md", variant: "raised" },
  },
  link: {
    className: "link",
    slots: [],
    variants: {
      variant: ["underline", "plain"],
    },
    defaultVariants: { variant: "plain" },
  },
  mark: {
    className: "mark",
    slots: [],
    variants: {
      variant: ["subtle", "solid", "text", "plain"],
    },
    defaultVariants: {},
  },
  separator: {
    className: "separator",
    slots: [],
    variants: {
      variant: ["solid", "dashed", "dotted"],
      orientation: ["vertical", "horizontal"],
      size: ["xs", "sm", "md", "lg"],
    },
    defaultVariants: { size: "sm", variant: "solid", orientation: "horizontal" },
  },
  skeleton: {
    className: "skeleton",
    slots: [],
    variants: {
      loading: ["true", "false"],
      variant: ["pulse", "shine", "none"],
    },
    defaultVariants: { variant: "pulse", loading: true },
  },
  skipNavLink: {
    className: "skip-nav",
    slots: [],
    variants: {},
    defaultVariants: {},
  },
  spinner: {
    className: "spinner",
    slots: [],
    variants: {
      size: ["inherit", "xs", "sm", "md", "lg", "xl"],
    },
    defaultVariants: { size: "md" },
  },
  textarea: {
    className: "textarea",
    slots: [],
    variants: {
      size: ["xs", "sm", "md", "lg", "xl"],
      variant: ["outline", "subtle", "flushed"],
    },
    defaultVariants: { size: "md", variant: "outline" },
  },
  icon: {
    className: "icon",
    slots: [],
    variants: {
      size: ["inherit", "xs", "sm", "md", "lg", "xl", "2xl"],
    },
    defaultVariants: { size: "inherit" },
  },
  checkmark: {
    className: "checkmark",
    slots: [],
    variants: {
      size: ["xs", "sm", "md", "lg"],
      variant: ["solid", "outline", "subtle", "plain", "inverted"],
      filled: ["true"],
    },
    defaultVariants: { variant: "solid", size: "md" },
  },
  radiomark: {
    className: "radiomark",
    slots: [],
    variants: {
      variant: ["solid", "subtle", "outline", "inverted"],
      size: ["xs", "sm", "md", "lg"],
      filled: ["true"],
    },
    defaultVariants: { variant: "solid", size: "md" },
  },
  colorSwatch: {
    className: "color-swatch",
    slots: [],
    variants: {
      size: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "inherit", "full"],
      shape: ["square", "circle", "rounded"],
    },
    defaultVariants: { size: "md", shape: "rounded" },
  },
  container: {
    className: "container",
    slots: [],
    variants: {
      centerContent: ["true"],
      fluid: ["true"],
    },
    defaultVariants: {},
  },
} as const satisfies Record<string, RecipeShape>;
