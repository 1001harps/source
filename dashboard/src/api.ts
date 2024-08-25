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
  const res = await fetch(`${API_BASE_URL}/files/${id}`, {
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

export const deleteFile = async (id: string) => {
  await fetch(`${API_BASE_URL}/files/${id}`, {
    method: "DELETE",
    headers,
  });
};
