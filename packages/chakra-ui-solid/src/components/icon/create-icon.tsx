import { withDefaults } from "@chakra-ui-solid/core";
import type { JSX } from "@solidjs/web";
import type { Component } from "solid-js";
import { Icon, type IconProps } from "./icon";

export interface CreateIconOptions {
  /**
   * The `svg` viewBox.
   *
   * @default "0 0 24 24"
   */
  viewBox?: string;
  /**
   * The glyph's contents — one or more `path`/`g`/`circle` elements, **as a function**.
   *
   * A JSX element here would be built when the module is imported rather than when the component
   * renders, and a JSX constant at module scope takes an SSR route down before anything renders.
   * The function is called once per render, inside the owner that renders it.
   */
  path?: () => JSX.Element;
  /** Shorthand for a single-path glyph: its `d`, drawn in `currentColor`. */
  d?: string;
  /** The returned component's function name, which is what a stack trace and the devtools show. */
  displayName?: string;
  /** Values for any prop the caller leaves unset. A caller's own prop still wins. */
  defaultProps?: Partial<IconProps>;
}

/**
 * Builds a named {@link Icon} around a fixed glyph — the third way to get an icon, for one reused
 * enough to earn a name.
 *
 * ```tsx
 * const HeartIcon = createIcon({
 *   displayName: "HeartIcon",
 *   path: () => <path fill="currentColor" d="M19.5 13.572 12 21l-7.5-7.428…" />,
 * });
 *
 * <HeartIcon size="lg" color="red.500" />;
 * ```
 *
 * The result takes every `Icon` prop, so `size`, `color` and the rest of the style props work on it
 * exactly as they do on `Icon` itself.
 */
export function createIcon(options: CreateIconOptions): Component<IconProps> {
  const { viewBox = "0 0 24 24", d, path, displayName, defaultProps } = options;

  const CreatedIcon: Component<IconProps> = (props) => {
    // One defaults bag rather than Chakra's two spreads, in Chakra's precedence: `defaultProps` may
    // override `viewBox`, and a caller's prop beats both. As a spread before the props it would
    // lose to a wrapper forwarding an unset one (`CLAUDE.md`, *The third hazard*), which for
    // `viewBox` means an `svg` that draws nothing.
    //
    // Annotated rather than inferred: inferring it spreads every style prop's conditional-value
    // union into one object type and tsc gives up with TS2590, "union type too complex to
    // represent". The annotation is the same type, computed once.
    const defaults: Partial<IconProps> = { viewBox, ...defaultProps };
    const merged = withDefaults(props, defaults);

    return (
      // The glyph is written as a child, so it is the last source of `children` and wins over the
      // one riding in the spread — Chakra's shape, where the glyph is fixed and the caller's
      // children are not a way in. Read exactly once, so no `children()`.
      <Icon {...merged}>{path ? path() : <path fill="currentColor" d={d} />}</Icon>
    );
  };

  if (displayName !== undefined) {
    // Chakra sets `displayName`, which is React devtools' name for a component. Solid's read the
    // function's own name, so that is where it goes.
    Object.defineProperty(CreatedIcon, "name", { value: displayName });
  }

  return CreatedIcon;
}
