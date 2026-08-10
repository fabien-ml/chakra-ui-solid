import { HStack, VisuallyHidden } from "@chakra-ui-solid/components";
import type { JSX } from "@solidjs/web";

export default function VisuallyHiddenWithInput() {
  return (
    <HStack>
      The input is hidden
      <VisuallyHidden
        render={(props) => (
          <input
            {...(props as JSX.InputHTMLAttributes<HTMLInputElement>)}
            type="text"
            placeholder="Search..."
            aria-label="Search"
          />
        )}
      />
    </HStack>
  );
}
