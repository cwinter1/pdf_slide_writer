export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
