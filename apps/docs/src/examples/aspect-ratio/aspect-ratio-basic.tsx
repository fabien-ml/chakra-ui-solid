import { AspectRatio, Center } from "chakra-ui-solid";

export default function AspectRatioBasic() {
  return (
    <AspectRatio bg="bg.muted" ratio={16 / 9}>
      <Center fontSize="xl">16 / 9</Center>
    </AspectRatio>
  );
}
