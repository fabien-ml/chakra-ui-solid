#!/usr/bin/env node

// Generates the docs site's props tables from **our own types**, with no running system object.
//
// `docs-site.md` §4.2 gives the generator three inputs, and this script implements the one whose
// subject exists today:
//
//   1. our own part props        — the compiler API over src/components  ← here
//   2. the recipe's variant map  — the imported preset object            (step 4, with P7-A)
//   3. the machine's Props type  — @zag-js/<machine>'s types             (step 5, with Dialog)
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
const componentsSrc = join(repoRoot, "packages/chakra-ui-solid/src/components");
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

/**
 * `@default` split out of the prose, because the table gives it a column of its own.
 *
 * The tag is written the way the source spells the value — `@default "column"`, `@default 4 / 3` —
 * and the quotes are dropped here so the renderer decides how a default is *shown*. Left in the
 * description it reads as a sentence fragment at the end of every defaulted prop, which is what it
 * did until this column existed.
 */
function splitDefault(description) {
  const match = /@default\s+(.+?)\s*$/.exec(description);
  if (match === null) {
    return { description, defaultValue: null };
  }
  const value = match[1].replace(/^["'](.*)["']$/, "$1");
  return { description: description.slice(0, match.index).trim(), defaultValue: value };
}

/** `as?: ValidComponent` → `{ name: "as", required: false, type: "ValidComponent", … }`. */
function memberRow(member, sourceFile) {
  if (!ts.isPropertySignature(member) || !ts.isIdentifier(member.name)) {
    return null;
  }
  const { description, defaultValue } = splitDefault(jsDocOf(member, sourceFile));
  return {
    name: member.name.text,
    required: member.questionToken === undefined,
    type: member.type === undefined ? "unknown" : member.type.getText(sourceFile).trim(),
    defaultValue,
    description,
  };
}

/**
 * `type StackDirection = ConditionalValue<"row" | "column" | …>` — collected so a prop typed by the
 * alias can print what the alias *is*.
 *
 * A name a reader cannot look up is not a type to them. `direction?: StackDirection` in the Type
 * column says nothing that `direction` did not already say, and the four values it accepts — the
 * only thing they need — are one hop away in a file they are not reading.
 */
function typeAliasesIn(sourceFile) {
  const aliases = new Map();
  for (const statement of sourceFile.statements) {
    if (ts.isTypeAliasDeclaration(statement)) {
      aliases.set(statement.name.text, statement.type.getText(sourceFile).trim());
    }
  }
  return aliases;
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
 * The three props **every** component here takes, which no component declares.
 *
 * They come from `ChakraStylingProps`, which every `*Props` interface inherits through
 * `HTMLChakraProps`, so a table without them is missing three props a reader can genuinely pass —
 * and for a component that adds none of its own (`Container` before its variants, `Circle`,
 * `Float`) the table would otherwise be empty. chakra-ui.com does the same thing with its own
 * `as` and `asChild` rows; `render` is ours, because a Solid element cannot be cloned.
 *
 * Appended rather than expanded from the type, because the rest of what `HTMLChakraProps` carries
 * is the whole style-prop surface and every DOM attribute — several hundred names that would bury
 * these three.
 */
const UNIVERSAL_PROPS = [
  {
    name: "as",
    required: false,
    type: "ValidComponent",
    defaultValue: null,
    description: "The element or component to render instead of the default one.",
  },
  {
    name: "render",
    required: false,
    type: "(props) => JSX.Element",
    defaultValue: null,
    description:
      "Render an element of your own, given the computed props. A function, never an element — " +
      "Solid has no `cloneElement`, so an element could only be rendered with its props dropped.",
  },
  {
    name: "unstyled",
    required: false,
    type: "boolean",
    defaultValue: null,
    description:
      "Drop the component's own styles. Style props and the `css` prop still apply — the opt-out " +
      "is of the theme, not of styling.",
  },
];

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
    })
    .map((entry) => ({ ...entry, props: [...entry.props, ...UNIVERSAL_PROPS] }));
}

// `__tests__` is a directory beside the components, not one of them. Left in, it emits a
// `__tests__` "component" whose only rows are the universal three — a table no page asks for and
// every consumer of this file then has to filter out by name.
const componentDirs = readdirSync(componentsSrc, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("__"))
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
    // that cannot find `@chakra-ui-solid/core` still parses every file it was given, which is
    // all `interfacesIn` reads.
    skipLibCheck: true,
  });

  const aliases = new Map();
  for (const file of files) {
    const sourceFile = program.getSourceFile(file);
    if (sourceFile !== undefined) {
      for (const [name, text] of typeAliasesIn(sourceFile)) {
        aliases.set(name, text);
      }
    }
  }

  const interfaces = foldLocalOptions(
    files.flatMap((file) => {
      const sourceFile = program.getSourceFile(file);
      return sourceFile === undefined ? [] : interfacesIn(sourceFile);
    }),
  ).map((entry) => ({
    ...entry,
    props: entry.props.map((row) => ({ ...row, type: aliases.get(row.type) ?? row.type })),
  }));

  // A component that is one bare `chakra()` call declares no `*Props` interface at all — Center and
  // AbsoluteCenter are both a factory call and a variant. They still take the three universal props,
  // so they get an entry rather than none: a page asking for a table it will never have renders the
  // generator's loud "run `pnpm codegen`" fallback, which is a false alarm.
  tables[component] =
    interfaces.length > 0
      ? interfaces
      : [
          {
            name: `${component
              .split("-")
              .map((word) => word[0].toUpperCase() + word.slice(1))
              .join("")}Props`,
            description: "",
            // Empty rather than guessed: nothing here declares what such a component extends.
            extends: [],
            props: [...UNIVERSAL_PROPS],
          },
        ];
}

const banner = `// GENERATED by scripts/generate-props-tables.mjs — do not edit.
//
// One entry per component directory under packages/chakra-ui-solid/src/components, one row per interface member
// **the component itself declares**. Inherited members are named through \`extends\` rather than
// expanded: \`BoxProps\` inherits the whole style-prop surface and every DOM attribute, and listing
// those would bury the props the component adds (\`docs-site.md\` §4.2).

export interface PropRow {
  name: string;
  required: boolean;
  type: string;
  /** The \`@default\` tag's value, quotes stripped — \`null\` when the prop has no default. */
  defaultValue: string | null;
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
