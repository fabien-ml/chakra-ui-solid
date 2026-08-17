import { Button, Checkbox, Field, Input, Stack } from "chakra-ui-solid";

export default function CheckboxWithForm() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        console.log([...new FormData(event.currentTarget).entries()]);
      }}
    >
      <Stack maxW="sm" gap="4" align="flex-start">
        <Field.Root>
          <Field.Label>Username</Field.Label>
          <Input placeholder="username" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Password</Field.Label>
          <Input placeholder="password" />
        </Field.Root>

        <Checkbox.Root mt="2" name="remember" value="remember me">
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Remember me</Checkbox.Label>
        </Checkbox.Root>

        <Button type="submit" variant="solid" mt="3">
          Submit
        </Button>
      </Stack>
    </form>
  );
}
