import { parseSync } from "oxc-parser";
import { describe, expect, it } from "vitest";
import {
  findClassNameAssertions,
  findStylePropViolations,
  isElementBearingTest,
} from "../style-contract.mjs";

// Both rules land at step 3 with **no violation in the repo to point at**: Box writes no dynamic
// style prop, and every element-bearing test already asserts computed styles. A check that has
// never rejected anything is a check nobody knows works, so its subjects are fixtures here.

const isStyleProp = (name) => ["p", "w", "bg", "gapX", "_hover", "color", "css"].includes(name);

function violationsIn(source) {
  const { program, errors } = parseSync("probe.tsx", source, { sourceType: "module" });
  expect(errors).toEqual([]);
  return findStylePropViolations("probe.tsx", source, program, isStyleProp).violations;
}

describe("rule 1 — style-prop-static-value", () => {
  describe("what it catches, each of which renders unstyled with nothing to say so", () => {
    it.each([
      ["<Box w={someNumber} />", "the variable `someNumber`"],
      ["<Box p={props.padding} />", "a property read"],
      ["<Box w={computeWidth()} />", "a function call"],
      // This is source text handed to a parser, so the uninterpolated `${n}` IS the subject.
      // biome-ignore lint/suspicious/noTemplateCurlyInString: see above
      ["<Box w={`${n}px`} />", "template with an expression"],
      ["<Box _hover={{ padding: gap }} />", "the variable `gap`"],
      ["<Box color={[base, other]} />", "the variable `base`"],
    ])("catches %s", (source, kind) => {
      expect(violationsIn(source)).toEqual([
        { file: "probe.tsx", line: 1, prop: expect.any(String), kind },
      ]);
    });
  });

  describe("what it must leave alone, or the rule blocks the API it protects", () => {
    it.each([
      // Route 1 — a literal or token.
      '<Box p="4" />',
      "<Box p={4} />",
      '<Box bg="bg.panel" />',
      "<Box mt={-1} />",
      // Route 3 — the sanctioned escape hatch for a genuinely dynamic value.
      '<Box w="var(--w)" style={{ "--w": width() }} />',
      // A conditional block is an ordinary static value one level down.
      '<Box _hover={{ padding: "8" }} />',
      // The responsive array and object forms, both of which Panda extracts.
      '<Box color={["red", "green"]} />',
      '<Box p={{ base: "2", md: "8" }} />',
      // A ternary between two static values is still two static values.
      '<Box p={compact ? "2" : "8"} />',
      // Not a style prop at all.
      "<Box onClick={handleClick} />",
      // The `css` prop's value is a nested style object the factory forwards to `css()`.
      "<Box css={overrides} />",
    ])("leaves %s alone", (source) => {
      expect(violationsIn(source)).toEqual([]);
    });
  });

  it("counts what it judged, so a vacuous pass is distinguishable from a real one", () => {
    const source = '<Box p="4" bg="red" onClick={f} css={x} />';
    const { program } = parseSync("probe.tsx", source, { sourceType: "module" });
    expect(findStylePropViolations("probe.tsx", source, program, isStyleProp).checked).toBe(2);
  });
});

describe("rule 3 — no-class-name-assertion", () => {
  it.each([
    ['expect(el.classList.contains("p_4")).toBe(true);', "classList.contains(…)"],
    ['expect(el).toHaveClass("p_4");', "toHaveClass(…)"],
    ['expect(el.className).toBe("p_4 bg_red");', ".className compared to a string"],
    ['expect(el.getAttribute("class")).toContain("p_4");', 'getAttribute("class")'],
  ])("catches %s", (line, label) => {
    expect(findClassNameAssertions("a.browser.test.tsx", line)).toEqual([
      { file: "a.browser.test.tsx", line: 1, label, text: line },
    ]);
  });

  it.each([
    'expect(getComputedStyle(el).padding).toBe("16px");',
    'expect(declarationsForClassList(classes)).toMatchObject({ padding: "var(--spacing-4)" });',
    // A `class` prop being *set* is not an assertion about one.
    'render(() => <Box class="probe" />);',
  ])("leaves %s alone", (line) => {
    expect(findClassNameAssertions("a.browser.test.tsx", line)).toEqual([]);
  });

  it("applies where an element exists and nowhere else", () => {
    expect(isElementBearingTest("packages/x/src/a.browser.test.tsx")).toBe(true);
    expect(isElementBearingTest("packages/x/src/a.ssr.test.tsx")).toBe(true);
    // The `unit` project is exempt by construction: no element exists there, and the recipe
    // layer's own output IS a string.
    expect(isElementBearingTest("packages/x/src/a.test.ts")).toBe(false);
  });
});
