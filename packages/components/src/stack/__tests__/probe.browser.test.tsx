import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { afterEach, expect, it } from "vitest";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

const Probe = (props: { separator?: JSX.Element; children?: JSX.Element }) => (
  <div>
    {props.children}
    {props.separator}
    {props.separator}
    {props.separator}
  </div>
);

it("probes whether a JSX prop read three times yields three nodes", () => {
  mounted = mountElement(() => (
    <Probe separator={<hr data-sep="" />}>
      <span>a</span>
    </Probe>
  ));

  // eslint-disable-next-line no-console
  console.log("INLINE HTML:", mounted.element.outerHTML);
  expect(mounted.element.querySelectorAll("hr").length).toBe(3);
});

it("probes the hoisted-constant form", () => {
  const separator = (<hr data-sep="" />) as JSX.Element;
  mounted = mountElement(() => (
    <Probe separator={separator}>
      <span>a</span>
    </Probe>
  ));

  console.log("HOISTED HTML:", mounted.element.outerHTML);
  expect(mounted.element.querySelectorAll("hr").length).toBe(3);
});
