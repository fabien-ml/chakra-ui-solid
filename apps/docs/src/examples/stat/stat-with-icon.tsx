import { HStack, Icon, Stat } from "chakra-ui-solid";
import { DollarSignIcon } from "../../components/ui/icons";

export default function StatWithIcon() {
  return (
    <Stat.Root maxW="240px" borderWidth="1px" p="4" rounded="md">
      <HStack justify="space-between">
        <Stat.Label>Sales</Stat.Label>
        <Icon as={DollarSignIcon} color="fg.muted" />
      </HStack>
      <Stat.ValueText>$4.24k</Stat.ValueText>
    </Stat.Root>
  );
}
