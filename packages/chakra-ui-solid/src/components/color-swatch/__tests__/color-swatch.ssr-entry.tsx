import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { Box } from "../../box";
import { ColorSwatch, ColorSwatchMix, ColorSwatchPropsProvider } from "../color-swatch";

/**
 * The one ColorSwatch tree the `ssr` and `browser` projects share, so the server render they compare
 * is the same subject rather than two hand-kept copies.
 *
 * Three `ColorSwatchMix` sizes are here because the tree is **conditional on `items.length`**: a
 * `<For>` over two, three and four colours is two, three and four sets of hydration keys (`_hk` is
 * the positional marker Solid matches server and client nodes by), so a miscounted list shifts every
 * sibling after it. The three-colour one is also the only shape whose last cell carries two extra
 * style props, which changes that node's class string and nothing else about it.
 *
 * It is also the first subject whose styling rides an **inline `style` attribute** rather than a
 * class: `--color` is written into `style` on both sides, and a server and client that disagree
 * about that string leave a swatch painted by whichever side won, silently. The last swatch renders
 * under a props provider, which is the other half of the same question — Button is the only other
 * subject that server-renders a props context.
 */
export function Tree(): JSX.Element {
  return (
    <Box data-probe="root">
      <ColorSwatch value="#bada55" data-probe="single" />
      <ColorSwatchMix items={["red", "pink"]} data-probe="two" />
      <ColorSwatchMix items={["red", "pink", "green"]} size="lg" data-probe="three" />
      <ColorSwatchMix items={["lightgreen", "green", "darkgreen", "black"]} data-probe="four" />
      <ColorSwatchPropsProvider value={{ shape: "circle" }}>
        <ColorSwatch value="rgba(0, 0, 255, 0.5)" data-probe="from-context" />
      </ColorSwatchPropsProvider>
    </Box>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=color-swatch`. */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
