import type { ComponentProps } from "@solidjs/web";
import { Tag } from "chakra-ui-solid";
import { CheckIcon } from "../../components/ui/icons";

export default function TagAsButton() {
  // `render` is this port's `asChild`, and the cast is what a render prop costs — the computed
  // props are typed against the element the component would have rendered
  // (`concepts/composition.mdx`, *Best Practices*).
  return (
    <Tag.Root
      variant="solid"
      render={(props) => <button type="submit" {...(props as ComponentProps<"button">)} />}
    >
      <Tag.Label>Fish </Tag.Label>
      <CheckIcon />
    </Tag.Root>
  );
}
