import { SegmentGroup } from "chakra-ui-solid";

export default function SegmentedControlVertical() {
  return (
    <SegmentGroup.Root defaultValue="React" orientation="vertical">
      <SegmentGroup.Indicator />
      <SegmentGroup.Items items={["React", "Vue", "Solid"]} />
    </SegmentGroup.Root>
  );
}
