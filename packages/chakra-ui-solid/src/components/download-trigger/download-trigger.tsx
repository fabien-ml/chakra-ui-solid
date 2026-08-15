import {
  composeEventHandlers,
  type HTMLChakraProps,
  omitProps,
  renderStyled,
} from "@chakra-ui-solid/core";
import type { ComponentProps, ValidComponent } from "@solidjs/web";
import { type Component, merge } from "solid-js";
import { type CreateDownloadProps, createDownload } from "./create-download";

/**
 * The button's own props plus the three that describe the file. It renders a `button`, so every
 * native attribute works as it does on the element itself — except `type`, which is always
 * `"button"`: a download trigger never submits the form around it.
 */
export interface DownloadTriggerProps extends HTMLChakraProps<"button">, CreateDownloadProps {}

/** The DOM props DownloadTrigger forwards to the rendered element. */
type DownloadTriggerElementProps = ComponentProps<"button">;

/**
 * The three that drive the download rather than the element. Forwarded, `fileName` would reach the
 * DOM as an attribute and `data` would stringify a whole `Blob` into one.
 */
const DOWNLOAD_KEYS = ["fileName", "mimeType", "data"] as const;

/**
 * DownloadTrigger — a button that saves `data` to the reader's disk as `fileName`.
 *
 * ```tsx
 * <DownloadTrigger data="hello" fileName="hello.txt" mimeType="text/plain">
 *   Download
 * </DownloadTrigger>
 * ```
 *
 * **It has no styles of its own** — what renders is a bare `button` plus whatever style props you
 * pass. `render` is how it gets a look:
 * `render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}` puts the download
 * behavior on a real `Button`.
 *
 * `data` may be a string, a `Blob`, a `File`, or a function returning any of those — or a promise
 * for one, so a file that has to be fetched is only produced when the button is pressed. Every prop
 * is read at the moment of the click.
 *
 * An `onClick` of your own runs **before** the download and can cancel it with
 * `event.preventDefault()`.
 */
export const DownloadTrigger: Component<DownloadTriggerProps> = (props) => {
  const { download } = createDownload(props);

  // `type` is placed *after* the props rather than before them, and that is not the third hazard's
  // "attribute before the spread" — it is a fixed value rather than a default. A download trigger is
  // never a submit button in Chakra either (Ark writes `<ark.button {...rest} type="button">`), so
  // `<DownloadTrigger type="submit">` is a button here too.
  const elementProps = merge(omitProps(props, ...DOWNLOAD_KEYS), {
    type: "button",
    // Composed inside a getter, so the consumer's handler is read in the element's own event-binding
    // effect rather than untracked in this body. Theirs runs first, which is what makes
    // `preventDefault()` a cancel channel for the download.
    get onClick() {
      return composeEventHandlers<HTMLButtonElement, MouseEvent>(props.onClick, download);
    },
  });

  // No `recipeClass`, and no `createRecipeContext` seam to take one from: the `downloadTrigger`
  // recipe key resolves to no recipe in Chakra either, so what is left of the seam is a props
  // context with no writer — upstream destructures `withContext` alone and exports no provider.
  return renderStyled<DownloadTriggerElementProps, HTMLButtonElement>({
    as: (props.as ?? "button") as ValidComponent,
    render: props.render,
    props: elementProps as unknown as DownloadTriggerElementProps,
  });
};
