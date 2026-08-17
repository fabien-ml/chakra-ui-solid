import { SegmentGroup } from "chakra-ui-solid";

export default function SegmentedControlWithDisabledItem() {
  return (
    <SegmentGroup.Root defaultValue="React">
      <SegmentGroup.Indicator />
      <SegmentGroup.Items
        items={[
          { label: "React", value: "React" },
          { label: "Vue", value: "Vue", disabled: true },
          { label: "Solid", value: "Solid" },
        ]}
      />
    </SegmentGroup.Root>
  );
}
