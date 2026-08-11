import { Box } from "chakra-ui-solid";

export default function BoxPropertyCard() {
  return (
    <Box maxW="sm" borderWidth="1px" borderColor="border" borderRadius="l2" overflow="hidden">
      <Box height="40" bg="bg.emphasized" aria-hidden="true" />

      <Box p="4" display="flex" flexDirection="column" gap="2">
        <Box display="flex" alignItems="center" gap="2">
          <Box
            as="span"
            bg="teal.subtle"
            color="teal.fg"
            px="2"
            py="0.5"
            borderRadius="l1"
            fontSize="xs"
            fontWeight="medium"
          >
            Superhost
          </Box>
          <Box as="span" fontSize="sm" fontWeight="medium" color="fg">
            {data.rating} ({data.reviewCount})
          </Box>
        </Box>

        <Box fontWeight="medium" color="fg">
          {data.title}
        </Box>

        <Box color="fg.muted" fontSize="sm">
          {data.formattedPrice} · {data.beds} beds
        </Box>
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
