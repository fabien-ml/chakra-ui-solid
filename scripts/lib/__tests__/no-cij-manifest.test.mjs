import { describe, expect, it } from "vitest";
import { findCijEngines, flattenPnpmTree, parseLockfilePackages } from "../no-cij-manifest.mjs";

describe("check:no-cij-manifest", () => {
  describe("the engines", () => {
    it.each([
      "@emotion/react",
      "@emotion/styled",
      "@emotion/css",
      "styled-components",
      "goober",
      "@stitches/react",
    ])("flags %s", (name) => {
      expect(findCijEngines([{ name, version: "1.0.0" }], "test")).toHaveLength(1);
    });

    it("leaves the packages this repo actually depends on alone", () => {
      // `@pandacss/*` is the point: Panda computes class strings at build time and injects
      // nothing, which is why it satisfies §0 rather than being an exception to it
      // (`plan.md` §0.1). The near-miss names are here so a substring match cannot creep in.
      const clean = [
        "@pandacss/dev",
        "@zag-js/core",
        "solid-js",
        "@solidjs/web",
        "emotion-like-but-not",
        "unstyled-components",
        "vite-plugin-solid",
      ].map((name) => ({ name, version: "1.0.0" }));
      expect(findCijEngines(clean, "test")).toEqual([]);
    });
  });

  describe("reading the installed tree", () => {
    it("finds a transitive engine several levels down, and names who pulled it in", () => {
      const tree = [
        {
          name: "root",
          dependencies: {
            "some-ui-kit": {
              version: "2.0.0",
              dependencies: {
                "its-theme": { version: "1.0.0", dependencies: { goober: { version: "2.1.0" } } },
              },
            },
          },
        },
      ];
      const found = findCijEngines(flattenPnpmTree(tree), "pnpm ls");
      expect(found).toHaveLength(1);
      expect(found[0].name).toBe("goober");
      expect(found[0].via).toEqual(["root", "some-ui-kit@2.0.0", "its-theme@1.0.0"]);
    });

    it("dedupes a package shared by two dependants", () => {
      const shared = { version: "1.43.0" };
      const tree = [
        {
          name: "root",
          dependencies: {
            a: { version: "1.0.0", dependencies: { "@zag-js/core": shared } },
            b: { version: "1.0.0", dependencies: { "@zag-js/core": shared } },
          },
        },
      ];
      expect(flattenPnpmTree(tree).filter((p) => p.name === "@zag-js/core")).toHaveLength(1);
    });
  });

  describe("the lockfile cross-check", () => {
    it("reads scoped, unscoped and peer-suffixed keys", () => {
      const lockfile = [
        "packages:",
        "",
        "  '@zag-js/core@1.43.0':",
        "    resolution: {integrity: sha512-x}",
        "",
        "  goober@2.1.16:",
        "    resolution: {integrity: sha512-y}",
        "",
        "snapshots:",
        "",
        "  '@solidjs/web@2.0.0-beta.32(solid-js@2.0.0-beta.32)':",
        "    dependencies: {}",
        "",
      ].join("\n");

      const parsed = parseLockfilePackages(lockfile);
      expect(parsed).toContainEqual({ name: "@zag-js/core", version: "1.43.0" });
      expect(parsed).toContainEqual({ name: "goober", version: "2.1.16" });
      expect(parsed).toContainEqual({ name: "@solidjs/web", version: "2.0.0-beta.32" });
      expect(findCijEngines(parsed, "pnpm-lock.yaml")).toHaveLength(1);
    });
  });
});
