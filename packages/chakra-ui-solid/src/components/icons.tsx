/**
 * @license
 * The glyphs below are copied from Chakra UI (`@chakra-ui/react`,
 * `packages/react/src/components/icons.tsx`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 *
 * Two changes. **`ErrorIcon` is not ported** — nothing upstream imports it, and `Field` builds its
 * own through `createIcon` rather than reaching for it. And each glyph carries `aria-hidden="true"`
 * before its spread, which upstream omits: it is the a11y lint's marker for a decorative glyph
 * rather than behaviour Chakra lacks, it stays overridable, and `CloseIcon` already carried it here.
 *
 * Chakra's own header credits https://react-icons.github.io/react-icons/ for the ideas, and several
 * of these are recognisably Lucide's. They are attributed to Chakra because Chakra's file is where
 * they were taken from.
 */

import { chakra, type HTMLChakraProps } from "@chakra-ui-solid/core";

/**
 * Internal. Not exported from the package barrel, and not a `chakraUiSolid.entries` row — these are
 * the default glyphs component recipes render, not an icon set we ship. A consumer who wants icons
 * brings their own and wraps them in {@link Icon}.
 *
 * **`chakra.svg`, not a leaf `<svg>`.** Call sites pass style props — `<CheckIcon boxSize="1em" />`
 * is how menu, select, clipboard and code-block size theirs — so these have to run through the
 * style pipeline. That makes `fill`, `stroke` and the three `stroke*` props Panda's rather than the
 * DOM's, exactly as `chakra.svg` does upstream. They are literal attributes on a `chakra.*` element,
 * which is what keeps them statically extractable; moved into a shared constant they would silently
 * generate nothing.
 */
interface SvgProps extends HTMLChakraProps<"svg"> {}

export const CheckIcon = (props: SvgProps) => (
  <chakra.svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M20 6 9 17l-5-5" />
  </chakra.svg>
);

export const ChevronLeftIcon = (props: SvgProps) => (
  <chakra.svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="m15 18-6-6 6-6" />
  </chakra.svg>
);

export const ChevronUpIcon = (props: SvgProps) => (
  <chakra.svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="m18 15-6-6-6 6" />
  </chakra.svg>
);

export const ChevronDownIcon = (props: SvgProps) => (
  <chakra.svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="m6 9 6 6 6-6" />
  </chakra.svg>
);

export const ChevronRightIcon = (props: SvgProps) => (
  <chakra.svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="m9 18 6-6-6-6" />
  </chakra.svg>
);

/**
 * The typo is upstream's, and it is load-bearing: `breadcrumb` imports this name while `pagination`
 * imports {@link EllipsisIcon}. Two exports, one glyph. Renaming it would break the port's 1:1 with
 * a file we do not own.
 */
export const EllpsisIcon = (props: SvgProps) => (
  <chakra.svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </chakra.svg>
);

export const ArrowUpIcon = (props: SvgProps) => (
  <chakra.svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </chakra.svg>
);

export const ArrowDownIcon = (props: SvgProps) => (
  <chakra.svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </chakra.svg>
);

export const CheckCircleIcon = (props: SvgProps) => (
  <chakra.svg
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    aria-hidden="true"
    {...props}
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11.0026 16L6.75999 11.7574L8.17421 10.3431L11.0026 13.1716L16.6595 7.51472L18.0737 8.92893L11.0026 16Z" />
  </chakra.svg>
);

export const WarningIcon = (props: SvgProps) => (
  <chakra.svg
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    aria-hidden="true"
    {...props}
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" />
  </chakra.svg>
);

export const InfoIcon = (props: SvgProps) => (
  <chakra.svg
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="0"
    aria-hidden="true"
    {...props}
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z" />
  </chakra.svg>
);

export const QuoteIcon = (props: SvgProps) => (
  <chakra.svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M6.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35l.539-.222.474-.197-.485-1.938-.597.144c-.191.048-.424.104-.689.171-.271.05-.56.187-.882.312-.318.142-.686.238-1.028.466-.344.218-.741.4-1.091.692-.339.301-.748.562-1.05.945-.33.358-.656.734-.909 1.162-.293.408-.492.856-.702 1.299-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539l.025.168.026-.006A4.5 4.5 0 1 0 6.5 10zm11 0c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35l.539-.222.474-.197-.485-1.938-.597.144c-.191.048-.424.104-.689.171-.271.05-.56.187-.882.312-.317.143-.686.238-1.028.467-.344.218-.741.4-1.091.692-.339.301-.748.562-1.05.944-.33.358-.656.734-.909 1.162-.293.408-.492.856-.702 1.299-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539l.025.168.026-.006A4.5 4.5 0 1 0 17.5 10z" />
  </chakra.svg>
);

export const StarIcon = (props: SvgProps) => (
  <chakra.svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </chakra.svg>
);

export const CloseIcon = (props: SvgProps) => (
  <chakra.svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 5.68342 4.90237 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C5.68342 19.0976 6.31658 19.0976 6.70711 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071C19.0976 18.3166 19.0976 17.6834 18.7071 17.2929L13.4142 12L18.7071 6.70711Z"
    />
  </chakra.svg>
);

export const FileIcon = (props: SvgProps) => (
  <chakra.svg
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </chakra.svg>
);

export const CopyIcon = (props: SvgProps) => (
  <chakra.svg
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </chakra.svg>
);

export const PipetteIcon = (props: SvgProps) => (
  <chakra.svg
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="m2 22 1-1h3l9-9" />
    <path d="M3 21v-3l9-9" />
    <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
  </chakra.svg>
);

export const EllipsisIcon = (props: SvgProps) => (
  <chakra.svg
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </chakra.svg>
);
