import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { Spinner } from "../../spinner";
import { Alert } from "../index";

/**
 * The one Alert tree the `ssr` and `browser` projects share, so the server render they compare is
 * the same subject rather than two hand-kept copies.
 *
 * Alert is the only row in this batch that earns a round-trip, and the reason is the indicator: its
 * children are **defaulted**, and the default is chosen by the Root's `status`. Three roots, three
 * different answers, and each consumes a different number of hydration keys (`_hk`, the positional
 * marker Solid matches a server node to a client node by):
 *
 * - **success** — the default glyph, drawn from the status map;
 * - **responsive** — a `status` that is an object rather than a string, which names no single glyph,
 *   so the `Show` renders nothing at all and the whole `svg` is absent from the markup;
 * - **spinner** — a consumer's own child, so the indicator's getter returns it and the default glyph
 *   is never built.
 *
 * The status also travels through a **context the Root opens around its own element**, which is a
 * context read on the server: the two builds have to agree about it before hydration is asked the
 * question.
 */
export function Tree(): JSX.Element {
  return (
    <div>
      <Alert.Root status="success" data-probe="success-root">
        <Alert.Indicator data-probe="success-indicator" />
        <Alert.Content data-probe="success-content">
          <Alert.Title data-probe="success-title">Data uploaded</Alert.Title>
          <Alert.Description data-probe="success-description">Fire on!</Alert.Description>
        </Alert.Content>
      </Alert.Root>

      <Alert.Root status={{ base: "info", md: "warning" }} data-probe="responsive-root">
        <Alert.Indicator data-probe="responsive-indicator" />
        <Alert.Title data-probe="responsive-title">Heads up</Alert.Title>
      </Alert.Root>

      <Alert.Root variant="solid" size="lg" data-probe="spinner-root">
        <Alert.Indicator data-probe="spinner-indicator">
          <Spinner size="sm" />
        </Alert.Indicator>
        <Alert.Title data-probe="spinner-title">We are loading something</Alert.Title>
      </Alert.Root>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=alert`. */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
