import { Container, Stack } from "chakra-ui-solid";
import { DecorativeBox } from "../components/decorative-box";

/**
 * The four written out, where the React version maps over a list.
 *
 * `maxW` is a style prop, and Panda generates its rule by reading this file — so a size it can only
 * know at runtime reaches the element as a class with no rule, and the container renders at its
 * default width (`CLAUDE.md`, *The hazard*).
 */
export default function ContainerWithSizes() {
  return (
    <Stack>
      <Container maxW="sm" px="2">
        <SampleText />
      </Container>

      <Container maxW="md" px="2">
        <SampleText />
      </Container>

      <Container maxW="xl" px="2">
        <SampleText />
      </Container>

      <Container maxW="2xl" px="2">
        <SampleText />
      </Container>
    </Stack>
  );
}

const SampleText = () => (
  <DecorativeBox>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam consectetur, tortor in lacinia
    eleifend, dui nisl tristique nunc.
  </DecorativeBox>
);
