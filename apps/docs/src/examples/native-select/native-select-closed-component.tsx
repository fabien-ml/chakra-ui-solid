import type { JSX } from "@solidjs/web";
import { NativeSelect as Select } from "chakra-ui-solid";
import { For, omit } from "solid-js";

type FieldProp = "name" | "value" | "onChange" | "ref";

interface NativeSelectProps
  extends Omit<Select.RootProps, FieldProp>,
    Pick<Select.FieldProps, FieldProp> {
  icon?: JSX.Element;
  items: Array<{ label: string; value: string; disabled?: boolean }>;
}

// Solid has no `forwardRef`, so there is nothing to wrap: `ref` is a prop like any other and
// travels to the field on the props it is read from.
function NativeSelect(props: NativeSelectProps) {
  // Named, never spread as a call expression: a call inside a JSX spread compiles to a memo, and
  // the receiving component then reads it untracked.
  const rootProps = omit(props, "icon", "items", "name", "value", "onChange", "ref", "children");

  return (
    <Select.Root {...rootProps}>
      <Select.Field ref={props.ref} name={props.name} value={props.value} onChange={props.onChange}>
        {props.children}
        <For each={props.items}>
          {(item) => (
            <option value={item.value} disabled={item.disabled}>
              {item.label}
            </option>
          )}
        </For>
      </Select.Field>
      <Select.Indicator>{props.icon}</Select.Indicator>
    </Select.Root>
  );
}

export default function NativeSelectClosedComponent() {
  return (
    <NativeSelect
      width="240px"
      items={[
        { label: "React", value: "react" },
        { label: "Vue", value: "vue" },
        { label: "Angular", value: "angular" },
      ]}
    />
  );
}
