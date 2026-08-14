/**
 * Other projects' marks, drawn to name the thing a page-header link crosses to: GitHub for the
 * source file, React for the same page on the React version's site.
 *
 * **Nominative use** — naming a project by its mark — which is the footing the framework logos in
 * `public/logos/` stand on, and it implies no endorsement or affiliation. Neither is our derivative
 * of anything, so this file carries no `@license` header; `attribution.config.ts` declares it in
 * `noticeOnlyPaths`, and the rows naming each mark's holder are in the root `NOTICE.md`.
 *
 * Inline rather than files in `public/`, because these sit inside a line of text: an `<img>` cannot
 * take `currentColor`, and the links are a muted colour that brightens on hover. **That monochrome
 * is the only departure from each mark as its project publishes it.**
 *
 * They are solid, where `~/components/ui/icons` is Lucide's 2px strokes, and that is not an
 * inconsistency: a mark is a mark, and chakra-ui.com sets the same two weights side by side —
 * `react-icons/io5`'s filled `IoLogoGithub` beside `react-icons/lu`'s stroked arrow
 * (`__reference-impl__/chakra-ui/apps/www/components/resource-icon.tsx`).
 *
 * The third glyph file, and the split is the point: Lucide's set is ISC, our bolt in
 * `~/components/ui/logo` is MIT, and these two are licensed to nobody here.
 */

import type { JSX } from "@solidjs/web";

/** GitHub's mark — `primer/octicons`, `icons/mark-github-16.svg`. */
export function GithubIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27s-1.36.09-2 .27c-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}

/**
 * React's mark — `facebook/react`, `fixtures/dom/public/react-logo.svg`: three ellipses at 0°, 60°
 * and 120° about a nucleus, in React's own viewBox.
 *
 * **The stroke is 1.6 where React's file says 1**, the one proportion changed here and the reason
 * it is: their file is drawn to be shown at a logo's size, and at the 18px this sits at beside a
 * solid GitHub mark, a 1-unit stroke in a 23-unit viewBox comes out under a pixel and reads as a
 * smudge. Nothing else moves — the ellipses, their angles and the nucleus are theirs.
 */
export function ReactIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-11.5 -10.23174 23 20.46348"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      <circle r="2.05" fill="currentColor" />
      <g stroke="currentColor" stroke-width="1.6" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}
