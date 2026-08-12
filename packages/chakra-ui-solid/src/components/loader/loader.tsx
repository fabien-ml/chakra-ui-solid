import { chakra, type HTMLChakraProps, withDefaults } from "@chakra-ui-solid/core";
import type { ComponentProps, JSX } from "@solidjs/web";
import { type Component, children, Match, omit, Show, Switch } from "solid-js";
import { AbsoluteCenter } from "../absolute-center";
import { Span } from "../span";
import { Spinner } from "../spinner";

export interface LoaderProps extends HTMLChakraProps<"span"> {
  /**
   * Whether the loader is showing. `false` renders the children on their own, with no wrapper
   * element at all, so a consumer can leave a Loader mounted across a state change rather than
   * swapping it in and out. Chakra's Button does not take that route — it mounts a Loader only
   * while `loading` and never passes this prop.
   *
   * @default true
   */
  visible?: boolean;
  /**
   * What to spin. Defaults to a {@link Spinner} sized and coloured off the surrounding text;
   * `spinner={false}` opts out of one entirely.
   */
  spinner?: JSX.Element;
  /**
   * Which side of `text` the spinner sits on. Only read when `text` is passed — without it the
   * spinner is centred over the children instead of placed beside them.
   *
   * @default "start"
   */
  spinnerPlacement?: "start" | "end";
  /** Shown in place of the children while loading, with the spinner beside it. */
  text?: JSX.Element;
}

/**
 * Loader — the two ways a control says *working* without changing size: a spinner beside a
 * replacement label, or a spinner centred over the children it hides.
 *
 * Every branch wraps in `display: contents`, so the Loader generates **no box of its own** and its
 * children lay out as though they were direct children of the consumer's element. Two consequences
 * the component depends on and does not supply:
 *
 * - `AbsoluteCenter` centres against the nearest **positioned ancestor**, and a `display: contents`
 *   wrapper is not one. That ancestor is the consumer's element — the `button` recipe carries
 *   `position: relative`, which is what lands a loading Button's spinner in its middle. Mounted
 *   under a static parent the spinner centres on whatever positioned ancestor is above, or on the
 *   page.
 * - `visibility: hidden` on a `display: contents` wrapper hides the children while they still take
 *   up their space in the *parent's* flow. That is what keeps the button's width from collapsing
 *   the moment it starts loading — the wrapper itself measures nothing.
 */
export const Loader: Component<LoaderProps> = (props) => {
  // `display` is a default like the other three, not a `merge` source before the spread: that form
  // resolves by presence, so a forwarded `display={props.display}` that is unset would erase it and
  // give the Loader a box of its own — which every note above says it does not have. An explicit
  // `display` still wins (`CLAUDE.md`, *The third hazard*).
  const merged = withDefaults(props, {
    display: "contents",
    visible: true,
    spinnerPlacement: "start",
  } satisfies Partial<LoaderProps>);

  const wrapperProps = omit(merged, "children", "spinner", "spinnerPlacement", "text", "visible");

  // **Both slots are resolved once and read only through the accessor.** A JSX-valued *prop*
  // compiles to a lazy getter that runs `createComponent` on **every** read, and each of these is
  // read twice in one render — once by the branch's gate, once by its body. Read raw, a
  // `spinner={<MySpinner />}` would be built twice and one of the two thrown away, taking whatever
  // state it had set up with it. `children()` collapses that to one construction, and its memo is
  // lazy, so a branch that is never selected builds nothing at all.
  //
  // The default belongs *inside* this call rather than in `withDefaults`, which builds its
  // `defaults` object **eagerly** — `{ spinner: <Spinner /> }` would run the Spinner component on
  // every Loader, including the ones the caller gave a spinner to and the ones that are not
  // visible. Module scope is not the alternative either: JSX there runs at import time and 500s
  // the SSR route.
  const spinner = children(
    () => merged.spinner ?? <Spinner size="inherit" borderWidth="0.125em" color="inherit" />,
  );
  const text = children(() => merged.text);

  // `merged.children` is deliberately **not** resolved this way: `Switch` reads the selected
  // branch's children and nothing else, so it is read exactly once per render, and a reflexive
  // `children()` on a single read only adds a memo and moves the subtree's hydration key.
  return (
    <Switch fallback={<Span {...wrapperProps}>{merged.children}</Span>}>
      <Match when={!merged.visible}>{merged.children}</Match>
      <Match when={text()}>
        <Span {...wrapperProps}>
          <Show when={merged.spinnerPlacement === "start"}>{spinner()}</Show>
          {text()}
          <Show when={merged.spinnerPlacement === "end"}>{spinner()}</Show>
        </Span>
      </Match>
      {/* `??` falls back on `null` too, so only a present-and-falsy `spinner={false}` gets past
          this gate to the bare wrapper below — an element is always truthy. */}
      <Match when={spinner()}>
        <Span {...wrapperProps}>
          <AbsoluteCenter display="inline-flex">{spinner()}</AbsoluteCenter>
          <Span visibility="hidden" display="contents">
            {merged.children}
          </Span>
        </Span>
      </Match>
    </Switch>
  );
};

/**
 * LoaderOverlay — the full-bleed centred layer a larger surface loads behind: a card, a table, a
 * dialog body. It positions against its parent like {@link AbsoluteCenter} does, but covers the
 * whole box rather than sitting at the middle of it, so a spinner and a label can sit side by side
 * with the `gap` already set.
 */
export const LoaderOverlay = chakra("div", {
  base: {
    position: "absolute",
    inset: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSize: "full",
    gap: "2",
  },
});

export type LoaderOverlayProps = ComponentProps<typeof LoaderOverlay>;
