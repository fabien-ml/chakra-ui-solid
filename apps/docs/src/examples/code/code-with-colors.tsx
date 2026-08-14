import { Code, Stack, Text } from "chakra-ui-solid";

/**
 * Ten palettes written out, where the React version maps over a `colorPalettes` array.
 *
 * `colorPalette` is a style prop, so its value has to be a literal Panda can see: passed as a loop
 * variable it computes a class no stylesheet has a rule for, and the row renders with no colour and
 * no error (`CLAUDE.md`, *silent unstyling*). The preset deliberately keeps `colorPalette` out of
 * `staticCss` — measured at 8 kB for a rescue most consumers never use — so the literal form is the
 * supported one, and this page shows the reader exactly what they would write.
 */
export default function CodeWithColors() {
  return (
    <Stack gap="2" align="flex-start">
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch" textStyle="sm">
          gray
        </Text>
        <Code colorPalette="gray" variant="solid">{`console.log()`}</Code>
        <Code colorPalette="gray" variant="outline">{`console.log()`}</Code>
        <Code colorPalette="gray" variant="subtle">{`console.log()`}</Code>
        <Code colorPalette="gray" variant="surface">{`console.log()`}</Code>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch" textStyle="sm">
          red
        </Text>
        <Code colorPalette="red" variant="solid">{`console.log()`}</Code>
        <Code colorPalette="red" variant="outline">{`console.log()`}</Code>
        <Code colorPalette="red" variant="subtle">{`console.log()`}</Code>
        <Code colorPalette="red" variant="surface">{`console.log()`}</Code>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch" textStyle="sm">
          green
        </Text>
        <Code colorPalette="green" variant="solid">{`console.log()`}</Code>
        <Code colorPalette="green" variant="outline">{`console.log()`}</Code>
        <Code colorPalette="green" variant="subtle">{`console.log()`}</Code>
        <Code colorPalette="green" variant="surface">{`console.log()`}</Code>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch" textStyle="sm">
          blue
        </Text>
        <Code colorPalette="blue" variant="solid">{`console.log()`}</Code>
        <Code colorPalette="blue" variant="outline">{`console.log()`}</Code>
        <Code colorPalette="blue" variant="subtle">{`console.log()`}</Code>
        <Code colorPalette="blue" variant="surface">{`console.log()`}</Code>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch" textStyle="sm">
          teal
        </Text>
        <Code colorPalette="teal" variant="solid">{`console.log()`}</Code>
        <Code colorPalette="teal" variant="outline">{`console.log()`}</Code>
        <Code colorPalette="teal" variant="subtle">{`console.log()`}</Code>
        <Code colorPalette="teal" variant="surface">{`console.log()`}</Code>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch" textStyle="sm">
          pink
        </Text>
        <Code colorPalette="pink" variant="solid">{`console.log()`}</Code>
        <Code colorPalette="pink" variant="outline">{`console.log()`}</Code>
        <Code colorPalette="pink" variant="subtle">{`console.log()`}</Code>
        <Code colorPalette="pink" variant="surface">{`console.log()`}</Code>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch" textStyle="sm">
          purple
        </Text>
        <Code colorPalette="purple" variant="solid">{`console.log()`}</Code>
        <Code colorPalette="purple" variant="outline">{`console.log()`}</Code>
        <Code colorPalette="purple" variant="subtle">{`console.log()`}</Code>
        <Code colorPalette="purple" variant="surface">{`console.log()`}</Code>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch" textStyle="sm">
          cyan
        </Text>
        <Code colorPalette="cyan" variant="solid">{`console.log()`}</Code>
        <Code colorPalette="cyan" variant="outline">{`console.log()`}</Code>
        <Code colorPalette="cyan" variant="subtle">{`console.log()`}</Code>
        <Code colorPalette="cyan" variant="surface">{`console.log()`}</Code>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch" textStyle="sm">
          orange
        </Text>
        <Code colorPalette="orange" variant="solid">{`console.log()`}</Code>
        <Code colorPalette="orange" variant="outline">{`console.log()`}</Code>
        <Code colorPalette="orange" variant="subtle">{`console.log()`}</Code>
        <Code colorPalette="orange" variant="surface">{`console.log()`}</Code>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch" textStyle="sm">
          yellow
        </Text>
        <Code colorPalette="yellow" variant="solid">{`console.log()`}</Code>
        <Code colorPalette="yellow" variant="outline">{`console.log()`}</Code>
        <Code colorPalette="yellow" variant="subtle">{`console.log()`}</Code>
        <Code colorPalette="yellow" variant="surface">{`console.log()`}</Code>
      </Stack>
    </Stack>
  );
}
