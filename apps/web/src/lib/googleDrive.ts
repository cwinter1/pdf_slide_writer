import type { DriveFile } from '../types';

const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

async function assertOk(response: Response, action: string): Promise<Response> {
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`${action} failed (${response.status}): ${body || response.statusText}`);
  }
  return response;
}

export async function downloadFile(fileId: string, accessToken: string): Promise<ArrayBuffer> {
  const response = await fetch(`${DRIVE_FILES_URL}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await assertOk(response, 'Download from Drive');
  return response.arrayBuffer();
}

export async function getFileMetadata(fileId: string, accessToken: string): Promise<DriveFile> {
  const response = await fetch(`${DRIVE_FILES_URL}/${fileId}?fields=id,name,mimeType`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await assertOk(response, 'Fetch file metadata');
  return response.json();
}

/** Overwrites the content of an existing Drive file in place, keeping its name/location. */
export async function updateFileContent(
  fileId: string,
  accessToken: string,
  blob: Blob,
): Promise<void> {
  const response = await fetch(`${DRIVE_UPLOAD_URL}/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': blob.type || 'application/pdf',
    },
    body: blob,
  });
  await assertOk(response, 'Save to Drive');
}

/** Creates a brand-new Drive file (used for "Save a copy"). */
export async function createFile(
  accessToken: string,
  name: string,
  blob: Blob,
  parentFolderId?: string,
): Promise<DriveFile> {
  const metadata = {
    name,
    mimeType: 'application/pdf',
    ...(parentFolderId ? { parents: [parentFolderId] } : {}),
  };

  const boundary = `pdf_slide_writer_${Date.now()}`;
  const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
  const mediaHeader = `--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`;
  const closing = `\r\n--${boundary}--`;

  const body = new Blob([metadataPart, mediaHeader, blob, closing]);

  const response = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id,name,mimeType`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  await assertOk(response, 'Save copy to Drive');
  return response.json();
}
