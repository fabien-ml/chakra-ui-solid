import { HStack, Icon, SegmentGroup } from "chakra-ui-solid";
import { BoxIcon, CopyIcon, MenuIcon } from "../../components/ui/icons";

/**
 * An entry's `label` is markup, not just a string — which is the whole point of the long form.
 *
 * The glyphs are substituted: the React version reaches for `react-icons`' `LuTable`, `LuGrid2X2`
 * and `LuList`, and this site ships only the Lucide icons its own pages already needed, so the three
 * nearest ones stand in (the precedent is `checkbox-card-with-icon`). `Icon as={…}`, never a whole
 * `svg` as a child: Solid has no `cloneElement`.
 *
 * The list is built **inside** the component. A JSX constant at module scope is constructed once,
 * outside any render, and server-rendering it throws.
 */
export default function SegmentedControlWithIcon() {
  const items = [
    {
      value: "table",
      label: (
        <HStack>
          <Icon as={MenuIcon} />
          Table
        </HStack>
      ),
    },
    {
      value: "board",
      label: (
        <HStack>
          <Icon as={CopyIcon} />
          Board
        </HStack>
      ),
    },
    {
      value: "list",
      label: (
        <HStack>
          <Icon as={BoxIcon} />
          List
        </HStack>
      ),
    },
  ];

  return (
    <SegmentGroup.Root defaultValue="table">
      <SegmentGroup.Indicator />
      <SegmentGroup.Items items={items} />
    </SegmentGroup.Root>
  );
}
