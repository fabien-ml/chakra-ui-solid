import type { JSX } from "@solidjs/web";
import { HStack, VisuallyHidden } from "chakra-ui-solid";

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
