import { useCallback, useState } from 'react';
import { requestAccessToken } from '../lib/googleAuth';

export interface GoogleAuthState {
  accessToken: string | null;
  expiresAt: number | null;
  isSignedIn: boolean;
  signIn: () => Promise<string>;
  /** Returns a token, silently refreshing via a fresh consent prompt if the current one has expired. */
  ensureAccessToken: () => Promise<string>;
  signOut: () => void;
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function useGoogleAuth(): GoogleAuthState {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  const signIn = useCallback(async () => {
    if (!clientId) {
      throw new Error(
        'Missing VITE_GOOGLE_CLIENT_ID. Set it in .env.local — see README for Google Cloud setup steps.',
      );
    }
    const result = await requestAccessToken(clientId);
    setAccessToken(result.accessToken);
    setExpiresAt(result.expiresAt);
    return result.accessToken;
  }, []);

  const ensureAccessToken = useCallback(async () => {
    // Leave a minute of buffer so a call doesn't start with a token that
    // expires mid-request.
    if (accessToken && expiresAt && expiresAt - Date.now() > 60_000) {
      return accessToken;
    }
    return signIn();
  }, [accessToken, expiresAt, signIn]);

  const signOut = useCallback(() => {
    setAccessToken(null);
    setExpiresAt(null);
  }, []);

  return {
    accessToken,
    expiresAt,
    isSignedIn: accessToken !== null,
    signIn,
    ensureAccessToken,
    signOut,
  };
}
