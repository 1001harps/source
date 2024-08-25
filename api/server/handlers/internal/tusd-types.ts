export type HookType =
  | "post-finish"
  | "post-terminate"
  | "post-receive"
  | "post-create"
  | "pre-create"
  | "pre-finish";

export type HTTPRequest = {
  Method: string;
  URI: string;
  RemoteAddr: string;
  Header: Record<string, string[]>;
};

export type FileInfo = {
  ID: string;
  Size: number;
  SizeIsDeferred: boolean;
  Offset: number;
  MetaData: Record<string, string>;
  IsPartial: boolean;
  IsFinal: boolean;
  PartialUploads: string[];
  Storage: Record<string, string> | null;
};

export type HookEvent = {
  Upload: FileInfo;
  HTTPRequest: HTTPRequest;
};

export type HookRequest = {
  Type: HookType;
  Event: HookEvent;
};

export type HookResponse = {
  HTTPResponse?: {
    statusCode?: number;
    headers?: { [key: string]: string | string[] };
    body?: string | Buffer;
  };
  RejectUpload?: boolean;
  ChangeFileInfo?: {
    ID: string;
    MetaData: Record<string, string>;
  };
  StopUpload?: boolean;
};
