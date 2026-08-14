import type { JSX } from "@solidjs/web";
import { List } from "chakra-ui-solid";
import { CircleCheckIcon, CircleDashedIcon } from "../../components/ui/icons";

type SvgProps = JSX.SvgSVGAttributes<SVGSVGElement>;

export default function ListWithIcon() {
  // `render` where the React version writes `asChild`: the indicator's own slot class lands on the
  // glyph rather than on a span around it.
  return (
    <List.Root gap="2" variant="plain" align="center">
      <List.Item>
        <List.Indicator
          color="green.500"
          render={(props) => <CircleCheckIcon {...(props as SvgProps)} />}
        />
        Lorem ipsum dolor sit amet, consectetur adipisicing elit
      </List.Item>
      <List.Item>
        <List.Indicator
          color="green.500"
          render={(props) => <CircleCheckIcon {...(props as SvgProps)} />}
        />
        Assumenda, quia temporibus eveniet a libero incidunt suscipit
      </List.Item>
      <List.Item>
        <List.Indicator
          color="green.500"
          render={(props) => <CircleDashedIcon {...(props as SvgProps)} />}
        />
        Quidem, ipsam illum quis sed voluptatum quae eum fugit earum
      </List.Item>
    </List.Root>
  );
}
