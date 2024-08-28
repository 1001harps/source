import { Button, Input, Stack } from "@chakra-ui/react";
import { ChangeEvent, useState } from "react";
import * as tus from "tus-js-client";

export const FileUpload = () => {
  const [error, setError] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [uploadPercent, setUploadPercent] = useState(0);

  const handleUpload = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!e.target.file || e.target.file.files.length === 0) {
      return;
    }

    setUploading(true);
    setError(false);
    setUploadPercent(0);

    const file = e.target.file.files[0];

    var upload = new tus.Upload(file, {
      endpoint: `${import.meta.env.VITE_UPLOAD_BASE_URL}/files/`,
      headers: {
        "X-API-KEY": import.meta.env.VITE_SOURCE_API_KEY,
      },
      onError: function (error) {
        console.log("faile: " + error);
        setError(true);
        setUploading(false);
      },
      onProgress(bytesUploaded: number, bytesTotal: number) {
        const percent = Math.floor((bytesUploaded / bytesTotal) * 100);
        setUploadPercent(percent);
      },
      onSuccess: function () {
        console.log("success", file);
        setUploading(false);
      },
    });

    upload.start();
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
          {uploading ? `uploading: ${uploadPercent}%` : "upload"}
        </Button>
      </Stack>
    </form>
  );
};
