import { Badge, Stack } from "chakra-ui-solid";

export default function BadgeWithVariants() {
  return (
    <Stack direction="row">
      <Badge variant="outline">Outline</Badge>
      <Badge variant="solid">Solid</Badge>
      <Badge variant="subtle">Subtle</Badge>
      <Badge variant="surface">Surface</Badge>
    </Stack>
  );
}
