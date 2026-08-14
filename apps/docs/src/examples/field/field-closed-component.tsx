import type { JSX } from "@solidjs/web";
import { Field as ChakraField, Input } from "chakra-ui-solid";
import { children, omit, Show } from "solid-js";

export interface FieldProps extends Omit<ChakraField.RootProps, "label"> {
  label?: JSX.Element;
  helperText?: JSX.Element;
  errorText?: JSX.Element;
  optionalText?: JSX.Element;
}

// Solid has no `forwardRef`: `ref` is a prop like any other, so it rides in on the spread below.
function Field(props: FieldProps) {
  // Each of the three is read by a gate *and* by the body it feeds. A JSX-element prop is a getter
  // that builds its element on every read, so it is resolved once here.
  const label = children(() => props.label);
  const helperText = children(() => props.helperText);
  const errorText = children(() => props.errorText);

  const rootProps = omit(props, "label", "children", "helperText", "errorText", "optionalText");

  return (
    <ChakraField.Root {...rootProps}>
      <Show when={label()}>
        <ChakraField.Label>
          {label()}
          <ChakraField.RequiredIndicator fallback={props.optionalText} />
        </ChakraField.Label>
      </Show>
      {props.children}
      <Show when={helperText()}>
        <ChakraField.HelperText>{helperText()}</ChakraField.HelperText>
      </Show>
      <Show when={errorText()}>
        <ChakraField.ErrorText>{errorText()}</ChakraField.ErrorText>
      </Show>
    </ChakraField.Root>
  );
}

export default function FieldClosedComponent() {
  return (
    <Field label="Email" helperText="We never share it.">
      <Input placeholder="me@example.com" />
    </Field>
  );
}
