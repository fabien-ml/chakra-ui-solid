import { createSystem, type SystemContext } from "@chakra-ui-solid/core";
import * as css from "@chakra-ui-solid/styled-system/css";
import { isCssProperty } from "@chakra-ui-solid/styled-system/is-valid-prop";
import * as patterns from "@chakra-ui-solid/styled-system/patterns";
import { token } from "@chakra-ui-solid/styled-system/tokens";

/**
 * The repo's own generated styled-system, assembled the way a consumer's `chakra-system.ts` is.
 *
 * This import is why `@chakra-ui-solid/core` no longer lists us in *its* `devDependencies`: the two
 * packages need each other for tests only, and declaring both directions makes Turbo's
 * `build`/`codegen` graph cyclic — `pnpm install` fails outright on its `postinstall`. The edge is
 * declared in the direction the source actually needs, which is this one; `core`'s own tests reach
 * the harness through `vitest-aliases.ts` and `tsconfig.base.json#paths`, as they always did.
 *
 * Every render helper here wraps its tree in a `<ChakraProvider value={testSystem}>`, because
 * nothing styled renders without one — `renderStyled` reads `css`, `cx` and `isValidProperty` off
 * the context, and the layout components read `token` and `patterns`. Sharing one instance across
 * `mount`, `hydrateFixture` and `renderServer` is what makes a hydration round-trip compare the
 * same system on both sides; two would compute two sets of class names and read as a mismatch.
 */
export const testSystem: SystemContext = createSystem({ ...css, isCssProperty, token, patterns });
