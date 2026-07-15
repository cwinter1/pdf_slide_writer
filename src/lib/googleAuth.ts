/**
 * Thin wrapper around Google Identity Services' OAuth2 token client.
 * We deliberately request the narrow `drive.file` scope: it only grants
 * access to files the user explicitly opens/creates through this app
 * (including files picked via the Google Picker), never their whole Drive.
 */

export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

const GIS_SRC = 'https://accounts.google.com/gsi/client';

let gisLoadPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
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

export function loadGoogleIdentityServices(): Promise<void> {
  if (!gisLoadPromise) {
    gisLoadPromise = loadScript(GIS_SRC);
  }
  return gisLoadPromise;
}

export interface TokenResult {
  accessToken: string;
  expiresAt: number;
}

/**
 * Opens the Google account chooser / consent screen and resolves with an
 * access token. Must be called from a user gesture (e.g. a click handler)
 * or Safari on iPad will block the popup.
 */
export function requestAccessToken(clientId: string): Promise<TokenResult> {
  return loadGoogleIdentityServices().then(
    () =>
      new Promise<TokenResult>((resolve, reject) => {
        const google = window.google;
        if (!google?.accounts?.oauth2) {
          reject(new Error('Google Identity Services failed to initialize.'));
          return;
        }
        const client = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: DRIVE_SCOPE,
          callback: (response) => {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }
            resolve({
              accessToken: response.access_token,
              expiresAt: Date.now() + response.expires_in * 1000,
            });
          },
          error_callback: (error) => {
            reject(new Error(error.message ?? 'Google sign-in was cancelled.'));
          },
        });
        client.requestAccessToken();
      }),
  );
}

export function revokeAccessToken(accessToken: string): void {
  window.google?.accounts?.oauth2?.revoke(accessToken, () => {});
}
