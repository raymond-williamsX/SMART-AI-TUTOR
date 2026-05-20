export type UploadedMaterialRecord = {
  id: string;
  userId: string;
  sessionId: string | null;
  fileName: string;
  fileType: string;
  storagePath: string;
  createdAt: string;
};
