/**
 * @license
 * The `AvatarIcon` glyph below is copied from Chakra UI (`@chakra-ui/react`,
 * `packages/react/src/components/avatar/avatar.tsx`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 *
 * One change to the glyph, and it is the one `icons.tsx` already makes to every glyph it carries:
 * `aria-hidden="true"` is written before the spread. The parts around it are API shape and owe
 * nothing.
 */

import { chakra, mergeProps, renderStyled, withDefaults } from "@chakra-ui-solid/core";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { type Component, children, omit } from "solid-js";
import type {
  AvatarContextProps,
  AvatarFallbackProps,
  AvatarIconProps,
  AvatarImageProps,
} from "./avatar.types";
import { useAvatarContext } from "./avatar-context";

type DivProps = ComponentProps<"div">;
type ImgProps = ComponentProps<"img">;

/**
 * The picture. It is in the DOM from the first byte and the machine carries it through `loading` →
 * `loaded` or `error`, putting `hidden` on it until the browser has actually decoded the file — so
 * an avatar never flashes a broken image, and the fallback is not a second mount.
 *
 * The two attributes are Chakra's defaults, and they are `withDefaults` rather than JSX attributes
 * before the spread so that a wrapper forwarding an unset `draggable={props.draggable}` cannot
 * delete them (`CLAUDE.md`, *The third hazard*).
 *
 * `"false"` is the string where a boolean would read more naturally, and Chakra passes the string
 * too: SolidJS drops a `false` attribute value rather than writing it, so the boolean would leave
 * the element with no `draggable` at all and the image draggable again.
 *
 * The prop is `referrerpolicy`, all lowercase, where React spells it `referrerPolicy` — SolidJS
 * names every HTML attribute as the DOM does, and that spelling is the library's throughout rather
 * than anything this component chose.
 */
export const AvatarImage: Component<AvatarImageProps> = (props) => {
  const ctx = useAvatarContext();

  const merged = withDefaults(props, {
    draggable: "false",
    referrerpolicy: "no-referrer",
  } satisfies Partial<AvatarImageProps>);

  // Every read goes to `merged`, never to `props`: `withDefaults` copies nothing, so a bag built
  // from `props` would reach the element with both defaults missing.
  const elementProps = mergeProps(() => ctx.getImageProps(), merged) as ImgProps;

  return renderStyled<ImgProps, HTMLImageElement>({
    as: (merged.as ?? "img") as ValidComponent,
    props: elementProps,
    render: merged.render,
    recipeClass: () => ctx.slots().image,
  });
};

/**
 * The one or two letters a `name` is shown as: `"Segun Adebayo"` is `SA`, `"Segun"` is `S`. Anything
 * between the first word and the last is ignored, which is what keeps a middle name or a suffix out
 * of a two-letter badge.
 *
 * `charAt` rather than an index, because it answers `""` off the end of a string — so the one-word
 * case needs no branch of its own.
 */
function getInitials(name: string): string {
  const words = name.trim().split(" ");
  const firstWord = words[0] ?? "";
  const lastWord = (words.length > 1 ? words[words.length - 1] : undefined) ?? "";
  return firstWord.charAt(0) + lastWord.charAt(0);
}

/**
 * What shows while there is no image — the initials of a `name`, a child of your own, or
 * {@link AvatarIcon} when there is neither. The machine hides it once the image has decoded, so it
 * is what the server sends and what the reader sees first.
 */
export const AvatarFallback: Component<AvatarFallbackProps> = (props) => {
  const ctx = useAvatarContext();

  // One read of `props.children`, inside one `children()` call. The prop is a getter that runs
  // `createComponent` on every read, so the gate and the body would build a child twice and throw
  // one away — and the merged bag below re-reads its `children` on every spread pass, which
  // `children()` collapses to a single construction (`CLAUDE.md`, *The second hazard*).
  //
  // Truthiness, never `??`: Chakra's own gate is `if (props.children || props.asChild)`, so
  // `<Avatar.Fallback>{null}</Avatar.Fallback>` falls through to the icon where `??` would render
  // nothing.
  //
  // Chakra's second disjunct has no counterpart here, and that is the port rather than a gap. Under
  // `asChild` the child *is* the element, so React has to hand it back untouched; our `render` takes
  // a function and gives it the computed props, which leaves the content this part's own business —
  // so `<Avatar.Fallback name="Segun" render={…} />` still shows `S`, where dropping the initials
  // would be the surprise.
  const content = children(() => {
    const provided = props.children;
    if (provided) {
      return provided;
    }
    const name = props.name;
    return name ? getInitials(name) : <AvatarIcon />;
  });

  // `name` is an input to the text above, not an attribute — forwarded, it would land on the `div`
  // as `name="Segun Adebayo"`, which is Chakra's `const { name: _, ...rest }` in `omit`'s spelling.
  const elementProps = mergeProps(() => ctx.getFallbackProps(), omit(props, "name"), {
    get children() {
      return content();
    },
  }) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => ctx.slots().fallback,
  });
};

/**
 * The generic person glyph — what an avatar shows when it has neither an image nor a name.
 *
 * `Avatar.Fallback` renders it for you, so reach for it directly only to place it somewhere else or
 * to restyle it: `<Avatar.Fallback><Avatar.Icon color="fg.muted" /></Avatar.Fallback>`.
 *
 * `chakra.svg` rather than a leaf `<svg>`, and every attribute a literal on the element: that is
 * what keeps `width`/`height` — style props here, not DOM attributes — statically extractable.
 * Moved into a shared constant they would generate nothing, silently.
 */
export const AvatarIcon: Component<AvatarIconProps> = (props) => (
  <chakra.svg
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="0"
    width="1.2em"
    height="1.2em"
    aria-hidden="true"
    {...props}
  >
    <path d="M20 22H18V20C18 18.3431 16.6569 17 15 17H9C7.34315 17 6 18.3431 6 20V22H4V20C4 17.2386 6.23858 15 9 15H15C17.7614 15 20 17.2386 20 20V22ZM12 13C8.68629 13 6 10.3137 6 7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7C18 10.3137 15.3137 13 12 13ZM12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" />
  </chakra.svg>
);

/**
 * Hands the machine to a render prop, for reading its state without writing a component:
 * `<Avatar.Context>{(a) => <Show when={a.loaded}>ready</Show>}</Avatar.Context>`.
 *
 * The call happens once, in this body, which is not a tracking scope — so **the render prop must
 * return JSX**. A callback returning a plain string or a bare ternary reads the machine untracked
 * and freezes on the value it had at mount.
 */
export function AvatarContext(props: AvatarContextProps): JSX.Element {
  return props.children(useAvatarContext());
}
