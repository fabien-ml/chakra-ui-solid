import { Checkbox, Link } from "chakra-ui-solid";

export default function CheckboxWithLink() {
  return (
    <Checkbox.Root>
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>
        I agree to the{" "}
        <Link colorPalette="teal" href="https://google.com">
          terms and conditions
        </Link>
      </Checkbox.Label>
    </Checkbox.Root>
  );
}
