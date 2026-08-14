import { Badge, HStack, Stat } from "chakra-ui-solid";

export default function StatWithTrend() {
  return (
    <Stat.Root>
      <Stat.Label>Unique </Stat.Label>
      <HStack>
        {/* The React version formats this with `FormatNumber`, which is the `format` row and is not
            ported yet — the value is written out, and the trend badge is what the example shows. */}
        <Stat.ValueText>$8,456.40</Stat.ValueText>
        <Badge colorPalette="green" gap="0">
          <Stat.UpIndicator />
          12%
        </Badge>
      </HStack>
      <Stat.HelpText>since last month</Stat.HelpText>
    </Stat.Root>
  );
}
