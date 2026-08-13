import { Badge, Box, HStack, Icon, Text } from "chakra-ui-solid";
import { StarIcon } from "../components/site/icons";

export default function BoxPropertyCard() {
  return (
    <Box maxW="sm" borderWidth="1px" borderColor="border" borderRadius="l2" overflow="hidden">
      {/* Chakra's version puts an `Image` here, which has not shipped yet. */}
      <Box height="40" bg="bg.emphasized" aria-hidden="true" />

      <Box p="4" display="flex" flexDirection="column" gap="2">
        <HStack>
          <Badge colorPalette="teal" variant="solid">
            Superhost
          </Badge>
          <HStack gap="1" fontWeight="medium">
            <Icon as={StarIcon} color="orange.400" />
            <Text>
              {data.rating} ({data.reviewCount})
            </Text>
          </HStack>
        </HStack>

        <Text fontWeight="medium" color="fg">
          {data.title}
        </Text>

        <HStack color="fg.muted" fontSize="sm">
          {data.formattedPrice} · {data.beds} beds
        </HStack>
      </Box>
    </Box>
  );
}

const data = {
  beds: 3,
  title: "Modern home in city center in the heart of historic Los Angeles",
  formattedPrice: "$435",
  reviewCount: 34,
  rating: 4.5,
};
