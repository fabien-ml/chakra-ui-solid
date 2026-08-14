import { Stack, Tag, Text } from "chakra-ui-solid";
import { PlusIcon } from "../../components/ui/icons";

/**
 * Ten palettes written out, where the React version maps over a `colorPalettes` array.
 *
 * `colorPalette` is a style prop, so its value has to be a literal Panda can see: passed as a loop
 * variable it computes a class no stylesheet has a rule for, and the row renders with no colour and
 * no error (`CLAUDE.md`, *silent unstyling*). `code-with-colors` is the precedent.
 */
export default function TagWithColors() {
  return (
    <Stack gap="2" align="flex-start">
      <Stack align="center" direction="row" gap="10" px="4">
        <Text minW="8ch">gray</Text>

        <Tag.Root size="sm" colorPalette="gray">
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root size="sm" colorPalette="gray">
          <Tag.StartElement>
            <PlusIcon />
          </Tag.StartElement>
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root colorPalette="gray" variant="solid">
          <Tag.Label>Content</Tag.Label>
          <Tag.EndElement>
            <Tag.CloseTrigger />
          </Tag.EndElement>
        </Tag.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4">
        <Text minW="8ch">red</Text>

        <Tag.Root size="sm" colorPalette="red">
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root size="sm" colorPalette="red">
          <Tag.StartElement>
            <PlusIcon />
          </Tag.StartElement>
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root colorPalette="red" variant="solid">
          <Tag.Label>Content</Tag.Label>
          <Tag.EndElement>
            <Tag.CloseTrigger />
          </Tag.EndElement>
        </Tag.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4">
        <Text minW="8ch">green</Text>

        <Tag.Root size="sm" colorPalette="green">
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root size="sm" colorPalette="green">
          <Tag.StartElement>
            <PlusIcon />
          </Tag.StartElement>
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root colorPalette="green" variant="solid">
          <Tag.Label>Content</Tag.Label>
          <Tag.EndElement>
            <Tag.CloseTrigger />
          </Tag.EndElement>
        </Tag.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4">
        <Text minW="8ch">blue</Text>

        <Tag.Root size="sm" colorPalette="blue">
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root size="sm" colorPalette="blue">
          <Tag.StartElement>
            <PlusIcon />
          </Tag.StartElement>
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root colorPalette="blue" variant="solid">
          <Tag.Label>Content</Tag.Label>
          <Tag.EndElement>
            <Tag.CloseTrigger />
          </Tag.EndElement>
        </Tag.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4">
        <Text minW="8ch">teal</Text>

        <Tag.Root size="sm" colorPalette="teal">
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root size="sm" colorPalette="teal">
          <Tag.StartElement>
            <PlusIcon />
          </Tag.StartElement>
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root colorPalette="teal" variant="solid">
          <Tag.Label>Content</Tag.Label>
          <Tag.EndElement>
            <Tag.CloseTrigger />
          </Tag.EndElement>
        </Tag.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4">
        <Text minW="8ch">pink</Text>

        <Tag.Root size="sm" colorPalette="pink">
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root size="sm" colorPalette="pink">
          <Tag.StartElement>
            <PlusIcon />
          </Tag.StartElement>
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root colorPalette="pink" variant="solid">
          <Tag.Label>Content</Tag.Label>
          <Tag.EndElement>
            <Tag.CloseTrigger />
          </Tag.EndElement>
        </Tag.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4">
        <Text minW="8ch">purple</Text>

        <Tag.Root size="sm" colorPalette="purple">
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root size="sm" colorPalette="purple">
          <Tag.StartElement>
            <PlusIcon />
          </Tag.StartElement>
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root colorPalette="purple" variant="solid">
          <Tag.Label>Content</Tag.Label>
          <Tag.EndElement>
            <Tag.CloseTrigger />
          </Tag.EndElement>
        </Tag.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4">
        <Text minW="8ch">cyan</Text>

        <Tag.Root size="sm" colorPalette="cyan">
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root size="sm" colorPalette="cyan">
          <Tag.StartElement>
            <PlusIcon />
          </Tag.StartElement>
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root colorPalette="cyan" variant="solid">
          <Tag.Label>Content</Tag.Label>
          <Tag.EndElement>
            <Tag.CloseTrigger />
          </Tag.EndElement>
        </Tag.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4">
        <Text minW="8ch">orange</Text>

        <Tag.Root size="sm" colorPalette="orange">
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root size="sm" colorPalette="orange">
          <Tag.StartElement>
            <PlusIcon />
          </Tag.StartElement>
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root colorPalette="orange" variant="solid">
          <Tag.Label>Content</Tag.Label>
          <Tag.EndElement>
            <Tag.CloseTrigger />
          </Tag.EndElement>
        </Tag.Root>
      </Stack>
      <Stack align="center" direction="row" gap="10" px="4">
        <Text minW="8ch">yellow</Text>

        <Tag.Root size="sm" colorPalette="yellow">
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root size="sm" colorPalette="yellow">
          <Tag.StartElement>
            <PlusIcon />
          </Tag.StartElement>
          <Tag.Label>Content</Tag.Label>
        </Tag.Root>
        <Tag.Root colorPalette="yellow" variant="solid">
          <Tag.Label>Content</Tag.Label>
          <Tag.EndElement>
            <Tag.CloseTrigger />
          </Tag.EndElement>
        </Tag.Root>
      </Stack>
    </Stack>
  );
}
