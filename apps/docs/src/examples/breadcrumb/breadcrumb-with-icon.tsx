import { Breadcrumb } from "chakra-ui-solid";
import { HouseIcon, ShirtIcon } from "../../components/ui/icons";

export default function BreadcrumbWithIcon() {
  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">
            <HouseIcon />
            Home
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />

        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">
            <ShirtIcon />
            Men Wear
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />

        <Breadcrumb.Item>
          <Breadcrumb.CurrentLink>Trousers</Breadcrumb.CurrentLink>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
