/**
 * @license
 * The path data below is copied from lucide-icons/lucide — the SVG sources in `icons/`, one file
 * per glyph, named in the comment above each component. Taken from `lucide-static@1.31.0`.
 * Copyright (c) 2026 Lucide Icons and Contributors. Licensed under the ISC License.
 *
 * Fourteen of these are Lucide's own derivatives of Feather, and carry a second notice:
 * Copyright (c) 2013-present Cole Bemis, MIT License. Both licences are reproduced in full, and the
 * thirteen named, in the LICENSE and NOTICE.md at the repository root.
 *
 * This file has been modified from the original.
 *
 * Three changes, none stylistic. **Each glyph is a Solid component wrapping a leaf `<svg>`**, where
 * upstream ships one `.svg` file per glyph. **The framing moves into {@link base}** so a glyph
 * carries only its own paths. And **the 24×24 default becomes `1em`** — `react-icons` sizes at `1em`
 * too, and Chakra's own examples depend on it: `absolute-center-with-content` sets `fontSize="xl"`
 * on the *parent* and expects the icon to follow.
 *
 * **Why these are plain `<svg>` and not `chakra.svg`.** `svg` is not in the factory's
 * `exceptionPropMap` (`packages/core/src/factory/factory.tsx`), so `fill` and `stroke` are style
 * props there — they become a Panda class instead of an attribute. A class Panda never generated
 * renders nothing and raises nothing, and the framing below sits in a shared constant the extractor
 * cannot see, so every icon would come out silently filled black. Literal attributes on a leaf
 * `<svg>` have no such failure mode.
 *
 * Add a glyph by pasting its paths from `lucide-static`'s `icons/` — never by inlining an `<svg>`
 * somewhere else. The brand marks are the other file, `~/components/site/logo`.
 */

import type { JSX } from "@solidjs/web";

/**
 * Lucide's shared framing: a 24×24 viewBox drawn as 2px round-joined strokes, no fill.
 *
 * `1em` and `currentColor` are what let a caller size and colour a glyph with the `fontSize` and
 * `color` style props on any ancestor, which is why no icon here needs a Box wrapper.
 *
 * `aria-hidden` is deliberately *not* in here. It stays a literal attribute on each `<svg>` so the
 * a11y lint can see these are decorative, and so a caller who needs a labelled icon can override it.
 */
const base = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  width: "1em",
  height: "1em",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

/** lucide `arrow-left` — `icons/arrow-left.svg` */
export function ArrowLeftIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

/** lucide `arrow-right` — `icons/arrow-right.svg` */
export function ArrowRightIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/** lucide `arrow-up-right` — `icons/arrow-up-right.svg` */
export function ArrowUpRightIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

/** lucide `bell` — `icons/bell.svg` */
export function BellIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
    </svg>
  );
}

/** lucide `box` — `icons/box.svg` */
export function BoxIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

/** lucide `check` — `icons/check.svg` */
export function CheckIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** lucide `chevron-down` — `icons/chevron-down.svg` */
export function ChevronDownIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** lucide `chevron-left` — `icons/chevron-left.svg` */
export function ChevronLeftIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

/** lucide `chevron-right` — `icons/chevron-right.svg` */
export function ChevronRightIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/** lucide `copy` — `icons/copy.svg` */
export function CopyIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

/** lucide `external-link` — `icons/external-link.svg` */
export function ExternalLinkIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

/** lucide `heart` — `icons/heart.svg` */
export function HeartIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
    </svg>
  );
}

/** lucide `menu` — `icons/menu.svg` */
export function MenuIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
    </svg>
  );
}

/** lucide `moon` — `icons/moon.svg` */
export function MoonIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
    </svg>
  );
}

/** lucide `paint-bucket` — `icons/paint-bucket.svg` */
export function PaintBucketIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M11 7 6 2" />
      <path d="M18.992 12H2.041" />
      <path d="M21.145 18.38A3.34 3.34 0 0 1 20 16.5a3.3 3.3 0 0 1-1.145 1.88c-.575.46-.855 1.02-.855 1.595A2 2 0 0 0 20 22a2 2 0 0 0 2-2.025c0-.58-.285-1.13-.855-1.595" />
      <path d="m8.5 4.5 2.148-2.148a1.205 1.205 0 0 1 1.704 0l7.296 7.296a1.205 1.205 0 0 1 0 1.704l-7.592 7.592a3.615 3.615 0 0 1-5.112 0l-3.888-3.888a3.615 3.615 0 0 1 0-5.112L5.67 7.33" />
    </svg>
  );
}

/** lucide `party-popper` — `icons/party-popper.svg` */
export function PartyPopperIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M5.8 11.3 2 22l10.7-3.79" />
      <path d="M4 3h.01" />
      <path d="M22 8h.01" />
      <path d="M15 2h.01" />
      <path d="M22 20h.01" />
      <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
      <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17" />
      <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7" />
      <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />
    </svg>
  );
}

/** lucide `phone` — `icons/phone.svg` */
export function PhoneIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
    </svg>
  );
}

/** lucide `phone-forwarded` — `icons/phone-forwarded.svg` */
export function PhoneForwardedIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M14 6h8" />
      <path d="m18 2 4 4-4 4" />
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
    </svg>
  );
}

/** lucide `plus` — `icons/plus.svg` */
export function PlusIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

/** lucide `search` — `icons/search.svg` */
export function SearchIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </svg>
  );
}

/** lucide `sun` — `icons/sun.svg` */
export function SunIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

/** lucide `terminal` — `icons/terminal.svg` */
export function TerminalIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M12 19h8" />
      <path d="m4 17 6-6-6-6" />
    </svg>
  );
}

/** lucide `type` — `icons/type.svg` */
export function TypeIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M12 4v16" />
      <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
      <path d="M9 20h6" />
    </svg>
  );
}

/** lucide `x` — `icons/x.svg` */
export function XIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
