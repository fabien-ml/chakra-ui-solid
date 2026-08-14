import type { JSX } from "@solidjs/web";
import { Breadcrumb as ChakraBreadcrumb } from "chakra-ui-solid";
import { children, For, omit, Show } from "solid-js";

export interface BreadcrumbProps extends ChakraBreadcrumb.RootProps {
  separator?: JSX.Element;
  separatorGap?: ChakraBreadcrumb.ListProps["gap"];
  items: Array<{ title: JSX.Element; url?: string }>;
}

// Solid has no `forwardRef`, so there is nothing to wrap: `ref` is a prop like any other and
// travels to the root on the props it is read from.
function Breadcrumb(props: BreadcrumbProps) {
  // Named, never spread as a call expression: a call inside a JSX spread compiles to a memo, and
  // the receiving component then reads it untracked.
  const rootProps = omit(props, "separator", "separatorGap", "items");

  return (
    <ChakraBreadcrumb.Root {...rootProps}>
      <ChakraBreadcrumb.List gap={props.separatorGap}>
        <For each={props.items}>
          {(item, index) => {
            // One resolved copy per gap: `separator` is a JSX prop, so every read of it builds the
            // element again.
            const separator = children(() => props.separator);
            const last = () => index() === props.items.length - 1;

            return (
              <Show
                when={last()}
                fallback={
                  <>
                    <ChakraBreadcrumb.Item>
                      <ChakraBreadcrumb.Link href={item.url}>{item.title}</ChakraBreadcrumb.Link>
                    </ChakraBreadcrumb.Item>
                    <ChakraBreadcrumb.Separator>{separator()}</ChakraBreadcrumb.Separator>
                  </>
                }
              >
                <ChakraBreadcrumb.Item>
                  <ChakraBreadcrumb.CurrentLink>{item.title}</ChakraBreadcrumb.CurrentLink>
                </ChakraBreadcrumb.Item>
              </Show>
            );
          }}
        </For>
      </ChakraBreadcrumb.List>
    </ChakraBreadcrumb.Root>
  );
}

export default function BreadcrumbClosedComponent() {
  return (
    <Breadcrumb
      items={[{ title: "Docs", url: "#" }, { title: "Components", url: "#" }, { title: "Props" }]}
    />
  );
}
