/**
 * @license
 * Derived from chakra-ui/chakra-ui — `apps/www/components/site/icons.tsx` (`BlitzIcon`,
 * `BlitzFillIcon`) and `apps/www/components/logo.tsx` (`LogoIcon`).
 * Copyright (c) 2019 Chakra Systems Inc.
 *
 * Licensed under the MIT License. A copy of the license is at the repository root as LICENSE,
 * and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 *
 * Ported to Solid, with two changes that are not stylistic:
 *
 * **The gradients are defined once, in {@link SiteGradientDefs}, instead of per instance.** Chakra
 * gives each instance a `useId()`-scoped `<defs>`; that shape does not survive here. Solid 2.0 has
 * no `createUniqueId`, a generated id would have to agree between the prerendered HTML and the
 * hydrated client, and — the reason that decides it — `fill={`url(#${id})`}` is a template with an
 * expression in an attribute named after a CSS property, which `check:style-contract` rule 1
 * rejects on sight. Literal ids in one sprite make every attribute here static.
 *
 * **That hoist costs `currentColor`, so the token is named instead.** A `stop-color: currentColor`
 * resolves against the element the `<stop>` lives on — not the element referencing the gradient —
 * so once the `<defs>` moved out of the icon, Chakra's two `currentColor` stops started reading the
 * body's colour and the bolt came out the wrong shade in both modes.
 * `var(--chakra-colors-fg-inverted)` is the same value their `color="fg.inverted"` supplies, and it
 * is a custom property declared inside `.light` and `.dark`, so it still switches with the colour
 * mode from anywhere in the document.
 *
 * **The camel-cased SVG attributes are rewritten to their DOM names** (`stop-color`,
 * `stop-opacity`, `gradient-units`): Solid's compiler emits attribute names verbatim, where React
 * translates them.
 *
 * These are the brand marks, and they are the whole of this file. The site's UI icons are Lucide's
 * and live in `~/components/site/icons` under a different licence — the split is what keeps each
 * file owing exactly one upstream.
 */

import type { JSX } from "@solidjs/web";

/**
 * The three gradients every bolt on the site references, in one zero-sized `<svg>`.
 *
 * Rendered once, from the root layout, because `url(#…)` resolves document-wide — this is the
 * ordinary SVG-sprite arrangement. **Delete it and every bolt loses its fill silently**, which is
 * why it lives beside the icons that need it rather than in the layout that mounts it.
 */
export function SiteGradientDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <defs>
        <linearGradient
          id="blitz-outline"
          x1="122.5"
          y1="0"
          x2="122.5"
          y2="342"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="var(--chakra-colors-fg-inverted)" stop-opacity="0.5" />
          <stop offset="0.505" stop-color="#137773" stop-opacity="0.6" />
          <stop offset="1" stop-color="var(--chakra-colors-fg-inverted)" stop-opacity="0.5" />
        </linearGradient>

        <linearGradient
          id="logo-lower"
          x1="28.9534"
          y1="18.645"
          x2="0.786272"
          y2="18.9059"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#3585A3" />
          <stop offset="1" stop-color="#00DEAE" />
        </linearGradient>

        <linearGradient
          id="logo-upper"
          x1="1.67767"
          y1="7.45445"
          x2="26.7007"
          y2="6.80208"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#3585A3" />
          <stop offset="1" stop-color="#00DEAE" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * The large outline bolt behind the hero and the framework grid. It carries its own colour through
 * `blitz-outline` — placing it needs position and nothing else.
 */
export function BlitzIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg
      width="245"
      height="342"
      viewBox="0 0 245 342"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        opacity="0.4"
        d="M1.22588 185.078L181.791 1.26669C185.164 -2.1672 190.594 2.01153 188.316 6.28938L121.111 132.548C119.61 135.362 121.599 138.798 124.729 138.798H240.87C244.611 138.798 246.417 143.495 243.682 146.113L40.1606 340.813C36.5115 344.304 31.0798 339.384 34.0095 335.243L130.352 199.009C132.327 196.216 130.381 192.302 127.015 192.302H4.13106C0.451191 192.302 -1.38514 187.736 1.22588 185.078Z"
        fill="url(#blitz-outline)"
      />
    </svg>
  );
}

/** The small solid bolt, marking a section's eyebrow label. Takes its colour from `currentColor`. */
export function BlitzFillIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="19"
      viewBox="0 0 18 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M0.470859 12.9879L13.17 0.0888906C13.4071 -0.152085 13.789 0.14116 13.6288 0.44136L8.90232 9.3016C8.79678 9.49911 8.93668 9.74022 9.15676 9.74022H17.3249C17.5881 9.74022 17.7151 10.0699 17.5227 10.2536L3.20913 23.9167C2.95248 24.1617 2.57048 23.8165 2.77652 23.5258L9.55227 13.9656C9.69116 13.7695 9.5543 13.4949 9.31755 13.4949H0.67518C0.416376 13.4949 0.287227 13.1745 0.470859 12.9879Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** The filled bolt glyph, in the header beside the `chakra-ui-solid` wordmark. */
export function LogoIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="21"
      viewBox="0 0 30 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M29.5655 12.9244L23.0585 11.7206L22.3139 13.0099L20.4813 16.1828L15.7231 24.4212C15.5147 24.7819 14.9653 24.6335 14.9653 24.2166V17.2928V16.5412C14.9653 16.1509 14.6901 15.8153 14.3087 15.7404L6.89538 14.2841L0.259293 13.0708C0.269371 13.4155 0.350786 13.7586 0.505816 14.0761L5.98276 23.5803C6.74691 24.9063 8.15775 25.7221 9.68349 25.7201L20.1868 25.7061C21.7118 25.7041 23.1198 24.8854 23.8808 23.5585L29.2409 14.2113C29.4694 13.8138 29.5768 13.3679 29.5655 12.9244Z"
        fill="url(#logo-lower)"
      />
      <path
        d="M7.64197 12.9885L9.47736 9.80344L14.2073 1.59529C14.4154 1.2342 14.9653 1.38242 14.9653 1.79963V9.47096C14.9653 9.86168 15.2411 10.1976 15.6231 10.272L23.0585 11.7207L29.5655 12.9245C29.5572 12.5987 29.4841 12.2747 29.3464 11.9717C29.314 11.9004 29.2792 11.8299 29.2397 11.7613L23.8728 2.42387C23.1102 1.09724 21.7007 0.279938 20.1753 0.279938H9.63609C8.10822 0.279938 6.69683 1.09981 5.93521 2.42979L0.58357 11.7749C0.571248 11.7963 0.560556 11.8184 0.548935 11.8401C0.343478 12.2237 0.24692 12.6483 0.259294 13.0708L6.89539 14.2841L7.64197 12.9885Z"
        fill="url(#logo-upper)"
      />
    </svg>
  );
}
