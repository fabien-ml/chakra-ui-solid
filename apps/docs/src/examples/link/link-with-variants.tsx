import { Link, Stack } from "chakra-ui-solid";

export default function LinkWithVariants() {
  return (
    <Stack>
      <Link variant="underline" href="#">
        Link (Underline)
      </Link>
      <Link variant="plain" href="#">
        Link (Plain)
      </Link>
    </Stack>
  );
}
