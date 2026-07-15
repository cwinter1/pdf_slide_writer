interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
}

interface GoogleTokenErrorResponse {
  type: string;
  message?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

interface GoogleTokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
  error_callback?: (error: GoogleTokenErrorResponse) => void;
}

interface GoogleAccountsOauth2 {
  initTokenClient: (config: GoogleTokenClientConfig) => GoogleTokenClient;
  revoke: (accessToken: string, done: () => void) => void;
}

interface GoogleAccounts {
  oauth2: GoogleAccountsOauth2;
}

interface GoogleNamespace {
  accounts: GoogleAccounts;
  // Populated on `window.google.picker` once `gapi.load('picker', cb)`
  // resolves — NOT on `window.gapi.picker`, despite the "gapi.load" call
  // site; that's just the bootstrap loader.
  picker: GapiPickerNamespace;
}

interface GapiPickerBuilder {
  addView: (view: unknown) => GapiPickerBuilder;
  setOAuthToken: (token: string) => GapiPickerBuilder;
  setDeveloperKey: (key: string) => GapiPickerBuilder;
  setOrigin: (origin: string) => GapiPickerBuilder;
  setAppId: (appId: string) => GapiPickerBuilder;
  setCallback: (cb: (data: GooglePickerResponse) => void) => GapiPickerBuilder;
  setTitle: (title: string) => GapiPickerBuilder;
  build: () => { setVisible: (visible: boolean) => void };
}

export interface GooglePickerDocument {
  id: string;
  name: string;
  mimeType: string;
}

export interface GooglePickerResponse {
  action: string;
  docs?: GooglePickerDocument[];
}

interface GapiDocsView {
  setIncludeFolders: (v: boolean) => GapiDocsView;
  setMimeTypes: (mimeTypes: string) => GapiDocsView;
  setSelectFolderEnabled: (v: boolean) => GapiDocsView;
}

interface GapiPickerNamespace {
  DocsView: new (viewId?: unknown) => GapiDocsView;
  PickerBuilder: new () => GapiPickerBuilder;
  ViewId: { DOCS: unknown };
  Action: { PICKED: string; CANCEL: string };
}

interface GapiNamespace {
  load: (api: string, callback: () => void) => void;
}

declare global {
  interface Window {
    google?: GoogleNamespace;
    gapi?: GapiNamespace;
  }
}
