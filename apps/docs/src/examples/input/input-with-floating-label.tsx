import type { JSX } from "@solidjs/web";
import { Box, Field, Input, type InputProps } from "chakra-ui-solid";
import { createSignal, omit } from "solid-js";

interface FloatingLabelInputProps extends Omit<InputProps, "value"> {
  label: JSX.Element;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function FloatingLabelInput(props: FloatingLabelInputProps) {
  const [uncontrolled, setUncontrolled] = createSignal(props.defaultValue ?? "");
  const [focused, setFocused] = createSignal(false);

  const value = () => props.value ?? uncontrolled();
  // `|| undefined`, so the attribute is absent rather than `data-float="false"` — the recipe
  // selector below matches on presence.
  const shouldFloat = () => value().length > 0 || focused() || undefined;

  // Named, never spread as a call expression: a call inside a JSX spread compiles to a memo, and
  // the receiving component then reads it untracked.
  const inputProps = omit(props, "label", "value", "defaultValue", "onValueChange");

  return (
    <Box pos="relative" w="full">
      <Input
        {...inputProps}
        value={value()}
        data-float={shouldFloat()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onInput={(event) => {
          setUncontrolled(event.currentTarget.value);
          props.onValueChange?.(event.currentTarget.value);
        }}
      />
      <Field.Label
        data-float={shouldFloat()}
        css={{
          pos: "absolute",
          bg: "bg",
          px: "0.5",
          top: "2.5",
          insetStart: "3",
          fontWeight: "normal",
          pointerEvents: "none",
          transition: "position",
          color: "fg.muted",
          "&[data-float]": {
            top: "-3",
            insetStart: "2",
            color: "fg",
          },
        }}
      >
        {props.label}
      </Field.Label>
    </Box>
  );
}

export default function InputWithFloatingLabel() {
  return (
    <Field.Root>
      <FloatingLabelInput label="Email" />
      <Field.ErrorText>This field is required</Field.ErrorText>
    </Field.Root>
  );
}
