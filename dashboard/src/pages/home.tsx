import {
  Box,
  Button,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Link,
} from "@chakra-ui/react";
import { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { PlayerContext } from "../components/player";
import { FileDto, getFiles } from "../api";

export const Home = () => {
  const [files, setFiles] = useState<FileDto[]>([]);

  const { play } = useContext(PlayerContext);

  useEffect(() => {
    getFiles().then(setFiles);
  }, []);

  return (
    <Box>
      <Box mb="16px">
        <Button w="100%" colorScheme="blue" as={RouterLink} to="/file/upload">
          Upload
        </Button>
      </Box>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>id</Th>
              <Th>created</Th>
            </Tr>
          </Thead>

          <Tbody>
            {files.map((f) => (
              <Tr key={f.id}>
                <Td>
                  <Link as={RouterLink} to={`/file/${f.id}`}>
                    {f.id}
                  </Link>
                </Td>
                <Td>{f.created.toString()}</Td>
                <Td>
                  <Button
                    onClick={() => {
                      play(f.url as string);
                    }}
                    size="xs"
                    colorScheme="green"
                  >
                    play
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
