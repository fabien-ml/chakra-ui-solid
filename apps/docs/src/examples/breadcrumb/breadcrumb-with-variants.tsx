import { Breadcrumb, Stack } from "chakra-ui-solid";
import { For } from "solid-js";

const variants = ["plain", "underline"] as const;

export default function BreadcrumbWithVariants() {
  return (
    <Stack>
      <For each={variants}>
        {(variant) => (
          <Breadcrumb.Root variant={variant}>
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
