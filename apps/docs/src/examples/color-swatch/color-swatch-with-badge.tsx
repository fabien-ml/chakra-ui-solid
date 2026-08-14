import { Badge, ColorSwatch } from "chakra-ui-solid";

export default function ColorSwatchWithBadge() {
  return (
    <Badge>
      <ColorSwatch value="#bada55" boxSize="0.82em" />
      #bada55
    </Badge>
  );
}
