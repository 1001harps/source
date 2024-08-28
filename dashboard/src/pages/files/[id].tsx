import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Box, Button, Divider, Heading, Stack } from "@chakra-ui/react";
import { PlayerContext } from "../../components/player";
import { deleteFile, FileDto, getFile } from "../../api";

export const File = () => {
  let { id } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState<FileDto | null>(null);

  const { load, clear } = useContext(PlayerContext);

  useEffect(() => {
    if (!file) return;

    load(file.url as string);
  }, [file]);

  useEffect(() => {
    getFile(id as string).then(setFile);
  }, [id]);

  const handleDeleteClick = async () => {
    clear();
    await deleteFile(id as string);
    setFile(null);
    navigate("/files");
  };

  return (
    <>
      {file && (
        <Stack>
          <Heading size="md">{file.id}</Heading>
          <Divider />

          <Stack>
            <Box> created:{file.created.toString()}</Box>
          </Stack>

          <Divider />

          <Stack mt="auto">
            <Button onClick={handleDeleteClick} colorScheme="red">
              delete
            </Button>
          </Stack>
        </Stack>
      )}
    </>
  );
};
