import { SegmentGroup } from "chakra-ui-solid";

export default function SegmentedControlBasic() {
  return (
    <SegmentGroup.Root defaultValue="React">
      <SegmentGroup.Indicator />
      <SegmentGroup.Items items={["React", "Vue", "Solid"]} />
    </SegmentGroup.Root>
  );
}
