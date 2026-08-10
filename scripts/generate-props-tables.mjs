#!/usr/bin/env node

// Generates the docs site's props tables from **our own types**, with no running system object.
//
// `docs-site.md` §4.2 gives the generator three inputs, and this script implements the one whose
// subject exists today:
//
//   1. our own part props        — the TypeScript compiler API over packages/components/src   ← here
//   2. the recipe's variant map  — the imported preset object          (step 4, with P7-A)
//   3. the machine's Props type  — @zag-js/<machine>'s types           (step 5, with Dialog)
//
// Never hand-written, and the reason is one-directional: a component that gains a prop gains a row
// on the next build, whereas a hand-written table omits it silently and a reader concludes the prop
// does not exist — a failure with no error and no test (`docs-site.md` §4.2).
//
// **Own members only.** `BoxProps` extends `JsxStyleProps` and `JSX.HTMLAttributes<HTMLElement>`,
// so expanding it fully would emit several hundred rows — every style prop and every DOM attribute
// — and bury the two props Box actually adds. The heritage clauses are emitted as names instead,
// so the page can say what is inherited without transcribing it.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const componentsSrc = join(repoRoot, "packages/components/src");
const outputFile = join(repoRoot, "apps/docs/src/generated/props-tables.ts");

/** Every `.ts`/`.tsx` under a component's directory, tests and stories excluded. */
function sourceFilesFor(componentDir) {
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "__tests__" && entry.name !== "__fixtures__") {
          walk(absolute);
        }
      } else if (
        /\.tsx?$/.test(entry.name) &&
        !entry.name.includes(".test.") &&
        !entry.name.includes(".stories.")
      ) {
        files.push(absolute);
      }
    }
  };
  walk(componentDir);
  return files;
}

/**
 * The JSDoc paragraph above a declaration, read out of the source text.
 *
 * `ts.getJSDocCommentsAndTags` needs parent pointers, and `createProgram` does not set them — it
 * returns an empty list instead of throwing, which is how a generator quietly emits a table with
 * every description blank. Reading the comment ranges is parent-free and cannot fail that way.
 */
function jsDocOf(node, sourceFile) {
  const text = sourceFile.getFullText();
  const ranges = ts.getLeadingCommentRanges(text, node.getFullStart()) ?? [];
  const doc = ranges.filter((range) => text.slice(range.pos, range.pos + 3) === "/**").at(-1);
  if (doc === undefined) {
    return "";
  }
  return text
    .slice(doc.pos + 3, doc.end - 2)
    .split("\n")
    .map((line) => line.replace(/^\s*\*?\s?/, ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/** `as?: ValidComponent` → `{ name: "as", required: false, type: "ValidComponent", … }`. */
function memberRow(member, sourceFile) {
  if (!ts.isPropertySignature(member) || !ts.isIdentifier(member.name)) {
    return null;
  }
  return {
    name: member.name.text,
    required: member.questionToken === undefined,
    type: member.type === undefined ? "unknown" : member.type.getText(sourceFile).trim(),
    description: jsDocOf(member, sourceFile),
  };
}

function interfacesIn(sourceFile) {
  const found = [];
  for (const statement of sourceFile.statements) {
    if (
      !ts.isInterfaceDeclaration(statement) ||
      !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      continue;
    }
    found.push({
      name: statement.name.text,
      description: jsDocOf(statement, sourceFile),
      extends: (statement.heritageClauses ?? [])
        .flatMap((clause) => clause.types)
        .map((type) => type.getText(sourceFile).trim()),
      props: statement.members
        .map((member) => memberRow(member, sourceFile))
        .filter((row) => row !== null)
        .sort((a, b) => a.name.localeCompare(b.name)),
    });
  }
  return found;
}

/**
 * Chakra splits a component's own props across two interfaces — `FlexOptions` holds them and
 * `FlexProps` is that plus the element's — so a table built from `*Props` alone comes out **empty**
 * for half this tier: a page with a heading, column titles and no rows.
 *
 * So every exported interface is read, and the ones a `*Props` extends *from the same component*
 * are folded into it: their rows become its rows, and their names leave its `extends` list, which
 * otherwise sends a reader after a name no page documents. What stays in that list is the
 * genuinely inherited surface — `HTMLChakraProps`, `JsxStyleProps` — which is named rather than
 * expanded.
 */
function foldLocalOptions(interfaces) {
  const byName = new Map(interfaces.map((entry) => [entry.name, entry]));

  return interfaces
    .filter((entry) => entry.name.endsWith("Props"))
    .map((entry) => {
      const local = entry.extends.filter((base) => byName.has(base));
      if (local.length === 0) {
        return entry;
      }
      const rows = [...entry.props, ...local.flatMap((base) => byName.get(base).props)];
      return {
        ...entry,
        extends: entry.extends.filter((base) => !byName.has(base)),
        props: rows.sort((a, b) => a.name.localeCompare(b.name)),
      };
    });
}

const componentDirs = readdirSync(componentsSrc, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const tables = {};
for (const component of componentDirs) {
  const files = sourceFilesFor(join(componentsSrc, component));
  const program = ts.createProgram(files, {
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.Preserve,
    noEmit: true,
    // The interfaces are read syntactically, so nothing here needs to resolve — but a program
    // that cannot find `@chakra-ui-solid/system` still parses every file it was given, which is
    // all `interfacesIn` reads.
    skipLibCheck: true,
  });

  const interfaces = foldLocalOptions(
    files.flatMap((file) => {
      const sourceFile = program.getSourceFile(file);
      return sourceFile === undefined ? [] : interfacesIn(sourceFile);
    }),
  );

  if (interfaces.length > 0) {
    tables[component] = interfaces;
  }
}

const banner = `// GENERATED by scripts/generate-props-tables.mjs — do not edit.
//
// One entry per component directory under packages/components/src, one row per interface member
// **the component itself declares**. Inherited members are named through \`extends\` rather than
// expanded: \`BoxProps\` inherits the whole style-prop surface and every DOM attribute, and listing
// those would bury the props the component adds (\`docs-site.md\` §4.2).

export interface PropRow {
  name: string;
  required: boolean;
  type: string;
  description: string;
}

export interface PropsInterface {
  name: string;
  description: string;
  extends: string[];
  props: PropRow[];
}

export const propsTables: Record<string, PropsInterface[]> = `;

mkdirSync(dirname(outputFile), { recursive: true });
const contents = `${banner}${JSON.stringify(tables, null, 2)};\n`;

let previous = "";
try {
  previous = readFileSync(outputFile, "utf8");
} catch {
  // First run.
}
if (previous !== contents) {
  writeFileSync(outputFile, contents);
}

const rowCount = Object.values(tables)
  .flat()
  .reduce((total, entry) => total + entry.props.length, 0);

console.log(
  `props-tables — ${Object.keys(tables).length} component(s), ` +
    `${Object.values(tables).flat().length} interface(s), ${rowCount} own prop row(s).`,
);
