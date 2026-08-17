import { CheckboxCard, CheckboxGroup, Float, Icon, SimpleGrid } from "chakra-ui-solid";
import { For } from "solid-js";
import { AtSignIcon, CircleCheckIcon, SlashIcon, UserIcon } from "../../components/ui/icons";

const items = [
  { icon: CircleCheckIcon, label: "Admin", description: "Give full access" },
  { icon: UserIcon, label: "User", description: "Give limited access" },
  { icon: AtSignIcon, label: "Guest", description: "Give read-only access" },
  { icon: SlashIcon, label: "Blocked", description: "No access" },
];

export default function CheckboxCardWithIcon() {
  return (
    <CheckboxGroup defaultValue={["Guest"]}>
      <SimpleGrid minChildWidth="200px" gap="2">
        <For each={items}>
          {(item) => (
            <CheckboxCard.Root align="center" value={item.label}>
              <CheckboxCard.HiddenInput />
              <CheckboxCard.Control>
                <CheckboxCard.Content>
                  {/* `as`, never a whole `svg` as a child: Solid has no `cloneElement`, so a nested
                      glyph draws inside an empty box the recipe sized. */}
                  <Icon as={item.icon} size="xl" mb="2" />
                  <CheckboxCard.Label>{item.label}</CheckboxCard.Label>
                  <CheckboxCard.Description>{item.description}</CheckboxCard.Description>
                </CheckboxCard.Content>
                <Float placement="top-end" offset="6">
                  <CheckboxCard.Indicator />
                </Float>
              </CheckboxCard.Control>
            </CheckboxCard.Root>
          )}
        </For>
      </SimpleGrid>
    </CheckboxGroup>
  );
}
