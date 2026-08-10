import { Box, Container, Stack } from "@chakra-ui-solid/components";
import { For } from "solid-js";

const sizes = ["sm", "md", "xl", "2xl"] as const;

export default function ContainerWithSizes() {
  return (
    <Stack>
      <For each={sizes}>
        {(size) => (
          <Container maxW={size} px="2">
            <Box>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam consectetur, tortor in
              lacinia eleifend, dui nisl tristique nunc.
            </Box>
          </Container>
        )}
      </For>
    </Stack>
  );
}
