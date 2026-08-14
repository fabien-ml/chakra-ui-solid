import { Link, Text } from "chakra-ui-solid";

export default function LinkWithinText() {
  return (
    <Text>
      Visit the{" "}
      <Link variant="underline" href="https://chakra-ui.com" colorPalette="teal">
        Chakra UI
      </Link>{" "}
      website
    </Text>
  );
}
