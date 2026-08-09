/**
 * The logic behind `check:style-contract` — the lint rules that keep the styling layer's two silent
 * failure modes from shipping (`testing.md` §6).
 *
 * **Rule 1, `style-prop-static-value`.** A style-prop value in our own source must be a literal, a
 * token reference, or a `var(--…)` string. Panda extracts styles by scanning source text, so
 * `<Box w={someNumber}>` computes a class nobody generated: it renders nothing, raises nothing, and
 * passes every class-name assertion. The sanctioned route for a genuinely dynamic value is a CSS
 * custom property through inline `style`, consumed by a static class — and using it accidentally as
 * a literal is exactly the mistake this rule exists to make loud.
 *
 * **Rule 2, `require-style-source`,** is not here. It needs `renderStyled`'s `styleSource`
 * addition, which exists because a machine part feeds the factory a merged bag containing the
 * machine's own DOM attributes — and no machine part exists yet.
 *
 * **Rule 3, `no-class-name-assertion`.** A test with an element in front of it must assert a
 * computed style. `classList.contains("p_4")` passes on a completely unstyled element, so the
 * assertion and a total styling failure are indistinguishable. The `unit` project is exempt by
 * construction: there is no element there, and the recipe layer's own output *is* a string.
 */

/**
 * `p`, `bg`, `_hover` — the vocabulary is the generated `isCssProperty`, passed in so this module
 * stays pure.
 *
 * Returns the values it judged as well as the ones it rejected, because a rule that reports only
 * failures cannot tell "everything is static" apart from "nothing was scanned".
 */
export function findStylePropViolations(file, source, ast, isStyleProp) {
  const violations = [];
  let checked = 0;

  walk(ast, (node) => {
    if (node.type !== "JSXAttribute" || node.name?.type !== "JSXIdentifier") {
      return;
    }
    const name = node.name.name;
    // `css` is a style prop by `isCssProperty`, but its value is a nested style *object* rather
    // than a per-prop value, and the factory passes it to `css()` as a sibling argument. Its
    // contents are extracted the same way; the attribute itself is not one of rule 1's subjects.
    if (name === "css" || !isStyleProp(name)) {
      return;
    }
    checked++;
    const offender = firstDynamicValue(node.value);
    if (offender !== undefined) {
      violations.push({ file, line: lineAt(source, node.start), prop: name, kind: offender });
    }
  });

  return { violations, checked };
}

/**
 * The first part of a style-prop value that Panda cannot read statically, or `undefined` when the
 * whole value is extractable.
 *
 * Objects and arrays recurse, because a conditional (`_hover={{ padding: "8" }}`) and the
 * responsive array form (`color={["red", "green"]}`) are both ordinary static values with their
 * literals one level down.
 */
function firstDynamicValue(value) {
  if (value === null || value === undefined) {
    return undefined;
  }
  switch (value.type) {
    // `p="4"` — a bare string attribute.
    case "Literal":
    case "StringLiteral":
    case "JSXText":
      return undefined;
    case "JSXExpressionContainer":
      return firstDynamicValue(value.expression);
    case "TemplateLiteral":
      // `` w={`${x}px`} `` is a runtime value wearing a literal's clothes.
      return value.expressions.length === 0 ? undefined : "template with an expression";
    case "UnaryExpression":
      // `mt={-1}` parses as a unary minus over a literal.
      return firstDynamicValue(value.argument);
    case "ObjectExpression":
      for (const property of value.properties) {
        if (property.type !== "Property") {
          return "object spread";
        }
        const offender = firstDynamicValue(property.value);
        if (offender !== undefined) {
          return offender;
        }
      }
      return undefined;
    case "ArrayExpression":
      for (const element of value.elements) {
        if (element === null) {
          continue;
        }
        const offender = firstDynamicValue(element);
        if (offender !== undefined) {
          return offender;
        }
      }
      return undefined;
    case "NumericLiteral":
    case "BooleanLiteral":
      return undefined;
    case "Identifier":
      return `the variable \`${value.name}\``;
    case "CallExpression":
      return "a function call";
    case "MemberExpression":
      return "a property read";
    case "ConditionalExpression": {
      // A ternary between two static values is still two static values.
      return firstDynamicValue(value.consequent) ?? firstDynamicValue(value.alternate);
    }
    default:
      return `a ${value.type}`;
  }
}

const CLASS_NAME_ASSERTIONS = [
  { pattern: /\.classList\.contains\s*\(/, label: "classList.contains(…)" },
  { pattern: /\.toHaveClass\s*\(/, label: "toHaveClass(…)" },
  {
    pattern: /\.className\s*\)?\s*\)?\.(?:toBe|toEqual|toContain|toMatch)\s*\(/,
    label: ".className compared to a string",
  },
  { pattern: /getAttribute\s*\(\s*["']class["']\s*\)/, label: 'getAttribute("class")' },
];

/**
 * Rule 3, as a line scan rather than an AST walk: every form it rejects is a distinctive call
 * shape, and a scan reports the line the reader has to change.
 */
export function findClassNameAssertions(file, contents) {
  const violations = [];
  contents.split("\n").forEach((text, index) => {
    for (const { pattern, label } of CLASS_NAME_ASSERTIONS) {
      if (pattern.test(text)) {
        violations.push({ file, line: index + 1, label, text: text.trim() });
      }
    }
  });
  return violations;
}

/** A test file with an element in front of it — the `ssr` and `browser` projects. */
export function isElementBearingTest(file) {
  return /\.(browser|ssr)\.test\.[jt]sx?$/.test(file);
}

/** oxc's nodes carry byte offsets, not `loc` — the reader needs a line number to open the file at. */
function lineAt(source, offset) {
  if (typeof offset !== "number") {
    return 0;
  }
  let line = 1;
  for (let index = 0; index < offset && index < source.length; index++) {
    if (source[index] === "\n") {
      line++;
    }
  }
  return line;
}

function walk(node, visit) {
  if (node === null || typeof node !== "object") {
    return;
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      walk(child, visit);
    }
    return;
  }
  if (typeof node.type === "string") {
    visit(node);
  }
  for (const key of Object.keys(node)) {
    if (key === "parent" || key === "loc" || key === "range") {
      continue;
    }
    walk(node[key], visit);
  }
}
