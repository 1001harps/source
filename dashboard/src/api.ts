export interface FileDto {
  id: string;
  created: Date;
  path: string;
  url?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const headers = {
  "X-API-KEY": import.meta.env.VITE_SOURCE_API_KEY,
};

export const getFile = async (id: string): Promise<FileDto> => {
  const res = await fetch(`${API_BASE_URL}/file/${id}`, {
    headers,
  });

  return res.json();
};

export const getFiles = async (): Promise<FileDto[]> => {
  const res = await fetch(`${API_BASE_URL}/files`, {
    headers,
  });

  return res.json();
};

export const uploadFile = async (file: File): Promise<FileDto> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/file`, {
    method: "PUT",
    body: formData,
    headers,
  });

  return res.json();
};

export const deleteFile = async (id: string) => {
  await fetch(`${API_BASE_URL}/file/${id}`, {
    method: "DELETE",
    headers,
  });
};
