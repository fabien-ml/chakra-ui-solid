import { Blockquote, Stack, Text } from "chakra-ui-solid";

/**
 * Ten palettes written out, where the React version maps over a `colorPalettes` array.
 *
 * `colorPalette` is a style prop, so its value has to be a literal Panda can see: passed as a loop
 * variable it computes a class no stylesheet has a rule for, and the row renders with no colour and
 * no error (`CLAUDE.md`, *silent unstyling*). `code-with-colors` is the precedent.
 */
export default function BlockquoteWithColors() {
  return (
    <Stack gap="5" align="flex-start">
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch">gray</Text>
        <Blockquote.Root colorPalette="gray">
          <Blockquote.Content cite="Uzumaki Naruto">
            If anyone thinks he is something when he is nothing, he deceives himself. Each one
            should test his own actions.
          </Blockquote.Content>
          <Blockquote.Caption>
            — <cite>Uzumaki Naruto</cite>
          </Blockquote.Caption>
        </Blockquote.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch">red</Text>
        <Blockquote.Root colorPalette="red">
          <Blockquote.Content cite="Uzumaki Naruto">
            If anyone thinks he is something when he is nothing, he deceives himself. Each one
            should test his own actions.
          </Blockquote.Content>
          <Blockquote.Caption>
            — <cite>Uzumaki Naruto</cite>
          </Blockquote.Caption>
        </Blockquote.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch">green</Text>
        <Blockquote.Root colorPalette="green">
          <Blockquote.Content cite="Uzumaki Naruto">
            If anyone thinks he is something when he is nothing, he deceives himself. Each one
            should test his own actions.
          </Blockquote.Content>
          <Blockquote.Caption>
            — <cite>Uzumaki Naruto</cite>
          </Blockquote.Caption>
        </Blockquote.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch">blue</Text>
        <Blockquote.Root colorPalette="blue">
          <Blockquote.Content cite="Uzumaki Naruto">
            If anyone thinks he is something when he is nothing, he deceives himself. Each one
            should test his own actions.
          </Blockquote.Content>
          <Blockquote.Caption>
            — <cite>Uzumaki Naruto</cite>
          </Blockquote.Caption>
        </Blockquote.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch">teal</Text>
        <Blockquote.Root colorPalette="teal">
          <Blockquote.Content cite="Uzumaki Naruto">
            If anyone thinks he is something when he is nothing, he deceives himself. Each one
            should test his own actions.
          </Blockquote.Content>
          <Blockquote.Caption>
            — <cite>Uzumaki Naruto</cite>
          </Blockquote.Caption>
        </Blockquote.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch">pink</Text>
        <Blockquote.Root colorPalette="pink">
          <Blockquote.Content cite="Uzumaki Naruto">
            If anyone thinks he is something when he is nothing, he deceives himself. Each one
            should test his own actions.
          </Blockquote.Content>
          <Blockquote.Caption>
            — <cite>Uzumaki Naruto</cite>
          </Blockquote.Caption>
        </Blockquote.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch">purple</Text>
        <Blockquote.Root colorPalette="purple">
          <Blockquote.Content cite="Uzumaki Naruto">
            If anyone thinks he is something when he is nothing, he deceives himself. Each one
            should test his own actions.
          </Blockquote.Content>
          <Blockquote.Caption>
            — <cite>Uzumaki Naruto</cite>
          </Blockquote.Caption>
        </Blockquote.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch">cyan</Text>
        <Blockquote.Root colorPalette="cyan">
          <Blockquote.Content cite="Uzumaki Naruto">
            If anyone thinks he is something when he is nothing, he deceives himself. Each one
            should test his own actions.
          </Blockquote.Content>
          <Blockquote.Caption>
            — <cite>Uzumaki Naruto</cite>
          </Blockquote.Caption>
        </Blockquote.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch">orange</Text>
        <Blockquote.Root colorPalette="orange">
          <Blockquote.Content cite="Uzumaki Naruto">
            If anyone thinks he is something when he is nothing, he deceives himself. Each one
            should test his own actions.
          </Blockquote.Content>
          <Blockquote.Caption>
            — <cite>Uzumaki Naruto</cite>
          </Blockquote.Caption>
        </Blockquote.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4" width="full">
        <Text minW="8ch">yellow</Text>
        <Blockquote.Root colorPalette="yellow">
          <Blockquote.Content cite="Uzumaki Naruto">
            If anyone thinks he is something when he is nothing, he deceives himself. Each one
            should test his own actions.
          </Blockquote.Content>
          <Blockquote.Caption>
            — <cite>Uzumaki Naruto</cite>
          </Blockquote.Caption>
        </Blockquote.Root>
      </Stack>
    </Stack>
  );
}
