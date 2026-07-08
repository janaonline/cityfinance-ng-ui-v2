export interface S3FileURLResponse {
  success: boolean;
  message: string;
  data: [
    {
      file_name: string;
      mime_type: string;
      host: string;
      url: string;
      path: string;
      file_url: string;
      file_alias: string;
    },
  ];
}

export interface S3SignedUrlRequestItem {
  fileName: string;
  folder: string;
  mimeType: string;
  uploadId: string;
  expiresIn: number;
}

export interface S3UrlResult {
  url: string;
  fileUrl: string;
  fileAlias?: string;
  path?: string;
  fileSize?: number;
  uploadId?: string;
}
