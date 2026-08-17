import { SegmentGroup } from "chakra-ui-solid";

export default function SegmentedControlWithDisabled() {
  return (
    <SegmentGroup.Root disabled defaultValue="React">
      <SegmentGroup.Indicator />
      <SegmentGroup.Items items={["React", "Vue", "Solid"]} />
    </SegmentGroup.Root>
  );
}
