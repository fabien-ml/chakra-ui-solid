import { Alert } from "chakra-ui-solid";
import { BellIcon } from "../../components/ui/icons";

export default function AlertWithCustomIcon() {
  return (
    <Alert.Root status="warning">
      <Alert.Indicator>
        <BellIcon />
      </Alert.Indicator>
      <Alert.Title>Submitting this form will delete your account</Alert.Title>
    </Alert.Root>
  );
}
