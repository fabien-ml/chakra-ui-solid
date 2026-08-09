import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { EnvironmentProvider } from "../environment";

/**
 * The provider renders a real `<span>` when it has to discover its own root node, and that makes it
 * a hydration question rather than a styling one: Solid matches server and client nodes by
 * **position** (the `_hk` key it stamps on each), so an element the server omits and the client adds
 * shifts every following node's key and the whole subtree re-creates itself silently.
 *
 * So the span must be emitted on **both** sides in the discovery case, and on **neither** in the
 * explicit-value case. This file owns the server half; the browser file owns the client half, and
 * the two only mean something together.
 */

describe("EnvironmentProvider on the server", () => {
  it("renders its children with no DOM in sight", async () => {
    // Rendering the provider touches no DOM, which is what makes it safe at the root of an app.
    // *Calling* `getRootNode()` on the server is a different matter: its fallback is a bare
    // `document`, so it throws `ReferenceError: document is not defined` in Node. Nothing does
    // today — a machine does not start on the server — and the behaviour is inherited from Ark
    // rather than ours, so it is recorded in `decisions.md` D-126 and deliberately not asserted
    // here: pinning a defect as a contract is how it becomes intentional.
    const html = await renderToStream(() => (
      <EnvironmentProvider value={undefined}>
        <p>child</p>
      </EnvironmentProvider>
    ));

    expect(html).toContain("child");
  });

  it("emits the discovery probe when no value is given", async () => {
    const html = await renderToStream(() => (
      <EnvironmentProvider>
        <p>child</p>
      </EnvironmentProvider>
    ));

    expect(html).toContain("<span");
    expect(html).toContain("hidden");
  });

  it("emits no probe when a value is given", async () => {
    const html = await renderToStream(() => (
      <EnvironmentProvider value={{} as Document}>
        <p>child</p>
      </EnvironmentProvider>
    ));

    expect(html).not.toContain("<span");
  });
});
