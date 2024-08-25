import { File } from "../../../db/entity/File";

export interface FileDto {
  id: string;
  created: Date;
  path: string;
  url: string;
}

export const fileMapper = (file: File): FileDto => {
  return { id: file.id, created: file.created, path: file.path(), url: "" };
};
