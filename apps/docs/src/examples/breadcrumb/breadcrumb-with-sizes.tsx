import { Breadcrumb, Stack } from "chakra-ui-solid";
import { For } from "solid-js";

const sizes = ["sm", "md", "lg"] as const;

export default function BreadcrumbWithSizes() {
  return (
    <Stack>
      <For each={sizes}>
        {(size) => (
          <Breadcrumb.Root size={size}>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#">Docs</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#">Components</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.CurrentLink>Props</Breadcrumb.CurrentLink>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        )}
      </For>
    </Stack>
  );
}
