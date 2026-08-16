import type { JSX } from "@solidjs/web";
import { Button } from "chakra-ui-solid";

export default function ButtonAsLink() {
  return (
    // `render` is this port's `asChild`, and the cast is what a render prop costs — the computed
    // props are typed against the `button` the component would otherwise have rendered
    // (`concepts/composition.mdx`, *Best Practices*).
    <Button
      render={(props) => (
        <a {...(props as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} href="#as-link" />
      )}
    >
      Button
    </Button>
  );
}
