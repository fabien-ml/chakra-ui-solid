import { describe, expect, it } from "vitest";
import {
  findResolutionDrift,
  fromTsconfigPaths,
  fromViteAliases,
  normalizeSource,
  specifierFromAliasPattern,
} from "../resolution-sync.mjs";

const REPO_ROOT = "/repo";

describe("check:resolution-sync", () => {
  describe("projecting a Vite alias regex onto a specifier", () => {
    it("reads an exact match", () => {
      expect(specifierFromAliasPattern("^@chakra-ui-solid\\/system$")).toBe(
        "@chakra-ui-solid/system",
      );
    });

    it("reads a one-segment wildcard", () => {
      expect(specifierFromAliasPattern("^@chakra-ui-solid\\/components\\/(.+)$")).toBe(
        "@chakra-ui-solid/components/*",
      );
    });

    it("refuses an unanchored pattern", () => {
      // An unanchored `find` also captures unrelated specifiers, so there is no single tsconfig
      // path it corresponds to. Guessing one would make the check agree with a broken alias.
      expect(() => specifierFromAliasPattern("@chakra-ui-solid\\/system")).toThrow(/not anchored/);
    });

    it("refuses regex syntax it cannot project", () => {
      expect(() => specifierFromAliasPattern("^@chakra-ui-solid\\/(system|preset)$")).toThrow(
        /cannot project/,
      );
    });
  });

  describe("normalizeSource", () => {
    it("strips the repo root and the ./ prefix, and folds $1 onto *", () => {
      expect(normalizeSource("/repo/packages/system/src/index.ts", REPO_ROOT)).toBe(
        "packages/system/src/index.ts",
      );
      expect(normalizeSource("./packages/system/src/index.ts", REPO_ROOT)).toBe(
        "packages/system/src/index.ts",
      );
      expect(normalizeSource("/repo/packages/components/src/$1/index.ts", REPO_ROOT)).toBe(
        "packages/components/src/*/index.ts",
      );
    });
  });

  describe("fromTsconfigPaths", () => {
    it("projects a single-target path", () => {
      expect(
        fromTsconfigPaths(
          { "@chakra-ui-solid/system": ["./packages/system/src/index.ts"] },
          REPO_ROOT,
        ),
      ).toEqual([{ specifier: "@chakra-ui-solid/system", source: "packages/system/src/index.ts" }]);
    });

    it("treats an absent paths object as no declarations", () => {
      expect(fromTsconfigPaths(undefined, REPO_ROOT)).toEqual([]);
    });

    it("refuses a fallback list, which a Vite alias cannot express", () => {
      expect(() => fromTsconfigPaths({ "@x": ["./a.ts", "./b.ts"] }, REPO_ROOT)).toThrow(
        /2 targets/,
      );
    });
  });

  describe("findResolutionDrift", () => {
    const tsconfig = (paths) => ({
      name: "tsconfig.base.json#paths",
      entries: fromTsconfigPaths(paths, REPO_ROOT),
    });
    const aliases = (list) => ({
      name: "vitest-aliases.ts#chakraSolidAlias",
      entries: fromViteAliases(list, REPO_ROOT),
    });

    it("passes when both files declare the same resolution", () => {
      expect(
        findResolutionDrift([
          tsconfig({ "@chakra-ui-solid/zag-solid": ["./packages/zag-solid/src/index.ts"] }),
          aliases([
            {
              find: /^@chakra-ui-solid\/zag-solid$/,
              replacement: "/repo/packages/zag-solid/src/index.ts",
            },
          ]),
        ]),
      ).toEqual([]);
    });

    it("passes when both files are empty — the step-1 state", () => {
      expect(findResolutionDrift([tsconfig({}), aliases([])])).toEqual([]);
    });

    it("catches a package added to the tsconfig and not to the alias table", () => {
      const drift = findResolutionDrift([
        tsconfig({ "@chakra-ui-solid/zag-solid": ["./packages/zag-solid/src/index.ts"] }),
        aliases([]),
      ]);

      expect(drift).toEqual([
        {
          entry: "@chakra-ui-solid/zag-solid -> packages/zag-solid/src/index.ts",
          presentIn: ["tsconfig.base.json#paths"],
          missingFrom: ["vitest-aliases.ts#chakraSolidAlias"],
        },
      ]);
    });

    it("catches the two files pointing the same specifier at different sources", () => {
      // The silent one: both files declare the package, so nothing is obviously missing — they
      // just disagree about where its source is.
      const drift = findResolutionDrift([
        tsconfig({ "@chakra-ui-solid/system": ["./packages/system/src/index.ts"] }),
        aliases([
          {
            find: /^@chakra-ui-solid\/system$/,
            replacement: "/repo/packages/system/dist/index.js",
          },
        ]),
      ]);

      // Two rows, one per side: the alias points at `dist/`, which the tsconfig never declared,
      // and the tsconfig points at `src/`, which the alias table no longer does. Sorted by entry,
      // so `dist` precedes `src`.
      expect(drift).toHaveLength(2);
      expect(drift.map((d) => `${d.entry} | missing from ${d.missingFrom.join()}`)).toEqual([
        "@chakra-ui-solid/system -> packages/system/dist/index.js | missing from tsconfig.base.json#paths",
        "@chakra-ui-solid/system -> packages/system/src/index.ts | missing from vitest-aliases.ts#chakraSolidAlias",
      ]);
    });
  });
});
