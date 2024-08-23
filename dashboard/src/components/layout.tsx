import { Box, Stack, Text } from "@chakra-ui/react";
import { Player } from "./player";

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Stack h="100vh" align="center">
      <Box
        as="nav"
        w="100vw"
        bg="#112"
        color="white"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p="4"
      >
        <Box as="a" href="/">
          <Text as="span" fontWeight="bold">
            source dashboard
          </Text>
        </Box>
      </Box>

      <Box as="main" h="100%" p="16px" maxW="760px" w="100%">
        {children}
      </Box>

      <Player />
    </Stack>
  );
};
