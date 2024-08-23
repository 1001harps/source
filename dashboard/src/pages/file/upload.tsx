import { Button, Input, Stack } from "@chakra-ui/react";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadFile } from "../../api";

export const FileUpload = () => {
  const [error, setError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!e.target.file || e.target.file.files.length === 0) {
      return;
    }

    setUploading(true);
    setError(false);

    const file = e.target.file.files[0];

    try {
      const uploadedFile = await uploadFile(file);
      navigate(`/file/${uploadedFile.id}`);
    } catch (error) {
      console.error(error);
      setError(true);
    }

    setUploading(false);
  };

  if (error) {
    return <p>something went wrong</p>;
  }

  return (
    <form onSubmit={handleUpload}>
      <Stack>
        <Input
          p="16px"
          h="70px"
          border="none"
          w="100%"
          type="file"
          name="file"
        />
        <Button type="submit" disabled={uploading}>
          {uploading ? "uploading" : "upload"}
        </Button>
      </Stack>
    </form>
  );
};
