import { Blockquote, HStack, Stack, Text } from "chakra-ui-solid";
import { For } from "solid-js";

export default function BlockquoteWithJustify() {
  // A recipe variant may be a loop variable, where a style prop may not: the preset declares
  // `staticCss: ["*"]` on every recipe it ships, so all three `justify` classes are in the sheet
  // whether or not any file spells them.
  return (
    <Stack gap="20">
      <For each={["start", "center", "end"] as const}>
        {(justify) => (
          <HStack maxW="xl">
            <Text color="fg.muted" minW="6rem">
              {justify}
            </Text>
            <Blockquote.Root variant="plain" justify={justify}>
              <Blockquote.Content cite="Uzumaki Naruto">
                If anyone thinks he is something when he is nothing, he deceives himself. Each one
                should test his own actions. Then he can take pride in himself, without comparing
                himself to anyone else.
              </Blockquote.Content>
              <Blockquote.Caption>
                — <cite>Uzumaki Naruto</cite>
              </Blockquote.Caption>
            </Blockquote.Root>
          </HStack>
        )}
      </For>
    </Stack>
  );
}
