import type { DriveFile } from '../types';

const GAPI_SRC = 'https://apis.google.com/js/api.js';

let gapiLoadPromise: Promise<void> | null = null;
let pickerLoadPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

function loadGapi(): Promise<void> {
  if (!gapiLoadPromise) {
    gapiLoadPromise = loadScript(GAPI_SRC);
  }
  return gapiLoadPromise;
}

function loadPicker(): Promise<void> {
  if (!pickerLoadPromise) {
    // gapi.load('picker', cb) is only the bootstrap call; it attaches the
    // actual Picker classes (PickerBuilder, DocsView, ViewId, ...) onto
    // window.google.picker, not window.gapi.picker.
    pickerLoadPromise = loadGapi().then(
      () =>
        new Promise<void>((resolve) => {
          window.gapi!.load('picker', () => resolve());
        }),
    );
  }
  return pickerLoadPromise;
}

export interface OpenPickerOptions {
  accessToken: string;
  apiKey: string;
  appId?: string;
}

/** Opens the Google Picker filtered to PDFs and resolves with the chosen file, or null if cancelled. */
export function openDrivePdfPicker(options: OpenPickerOptions): Promise<DriveFile | null> {
  return loadPicker().then(
    () =>
      new Promise<DriveFile | null>((resolve, reject) => {
        const picker = window.google?.picker;
        if (!picker) {
          reject(new Error('Google Picker failed to load.'));
          return;
        }
        const view = new picker.DocsView(picker.ViewId.DOCS)
          .setIncludeFolders(true)
          .setSelectFolderEnabled(false)
          .setMimeTypes('application/pdf');

        const builder = new picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(options.accessToken)
          .setDeveloperKey(options.apiKey)
          .setTitle('Select a PDF to annotate');

        if (options.appId) {
          builder.setAppId(options.appId);
        }

        builder.setCallback((data) => {
          if (data.action === picker.Action.PICKED && data.docs?.[0]) {
            const doc = data.docs[0];
            resolve({ id: doc.id, name: doc.name, mimeType: doc.mimeType });
          } else if (data.action === picker.Action.CANCEL) {
            resolve(null);
          }
        });

        builder.build().setVisible(true);
      }),
  );
}
