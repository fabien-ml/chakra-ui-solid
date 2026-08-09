import { parseSync } from "oxc-parser";

/**
 * The logic behind `check:docs-consumer-config`.
 *
 * The docs app being a **consumer** is load-bearing rather than incidental (`docs-site.md` §1.1).
 * Three shortcuts would each turn the site from evidence into decoration, and none of them fails
 * anything on its own:
 *
 *   1. hand-writing a Panda knob `chakraConfig()` owns — `hash` above all, which is the one that
 *      silently unstyles a whole app when it disagrees across the boundary (`plan.md` §3.4)
 *   2. importing the repo's own dev stylesheet instead of running Panda
 *   3. keeping the `src` alias in the **production** build, so the site never resolves our
 *      packages through `exports` → `dist` the way a reader's app does
 *
 * The first is checked by parsing the config; the third by *calling* the Vite config in both
 * modes, which is stronger than a grep because it asserts the behaviour rather than the spelling.
 */

/** The only keys the docs app's `panda.config.ts` may declare beside the spread. */
export const ALLOWED_CONFIG_KEYS = ["include", "outdir"];

/**
 * @returns `{ spreadsChakraConfig, extraKeys }` — `extraKeys` is every declared key that is not
 * `include` or `outdir`.
 */
export function inspectPandaConfig(filePath, source) {
  const { program, errors } = parseSync(filePath, source, { sourceType: "module" });
  if (errors.length > 0) {
    throw new Error(`Could not parse ${filePath}: ${errors.map((e) => e.message).join(", ")}`);
  }

  const exported = program.body.find((node) => node.type === "ExportDefaultDeclaration");
  const call = exported?.declaration;
  if (call?.type !== "CallExpression" || call.callee?.name !== "defineConfig") {
    throw new Error(
      `${filePath} does not \`export default defineConfig({ … })\`. The check reads that call and ` +
        "nothing else, so any other shape is a config it cannot judge.",
    );
  }

  const object = call.arguments[0];
  if (object?.type !== "ObjectExpression") {
    throw new Error(`${filePath}: \`defineConfig\` is not called with an object literal.`);
  }

  let spreadsChakraConfig = false;
  const extraKeys = [];

  for (const property of object.properties) {
    if (property.type === "SpreadElement") {
      const argument = property.argument;
      if (argument.type === "CallExpression" && argument.callee?.name === "chakraConfig") {
        spreadsChakraConfig = true;
      } else {
        extraKeys.push("a spread of something other than `chakraConfig()`");
      }
      continue;
    }
    const key = property.key?.name ?? property.key?.value;
    if (!ALLOWED_CONFIG_KEYS.includes(key)) {
      extraKeys.push(String(key));
    }
  }

  return { spreadsChakraConfig, extraKeys };
}

/** Alias entries whose replacement points into a workspace package's `src`. */
export function srcAliases(aliases, repoRoot) {
  const root = repoRoot.split("\\").join("/");
  return (aliases ?? [])
    .filter((alias) => typeof alias?.replacement === "string")
    .map((alias) => ({
      find: String(alias.find),
      replacement: alias.replacement.split("\\").join("/").replace(`${root}/`, ""),
    }))
    .filter((alias) => /^packages\/[^/]+\/src\b/.test(alias.replacement));
}
