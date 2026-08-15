import { ChakraProvider } from "@chakra-ui-solid/core";
import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { testSystem } from "../system";

/**
 * `renderToStream` with the `<ChakraProvider>` every styled element needs above it — `mount`'s
 * counterpart for the `ssr` project, and the exact wrapper `hydrateFixture` puts on the client
 * side, so a server render and the hydration that claims it are the same tree.
 *
 * Reached through its own specifier rather than the package barrel: that barrel exports the axe
 * helper, which pulls `axe-core` in at module load, and this project has no DOM for it.
 */
export async function renderServer(ui: () => JSX.Element): Promise<string> {
  return await renderToStream(() => <ChakraProvider value={testSystem}>{ui()}</ChakraProvider>);
}
