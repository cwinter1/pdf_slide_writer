import { GoogleDriveIcon } from './icons';

interface WelcomeScreenProps {
  isSignedIn: boolean;
  busy: boolean;
  errorMessage: string | null;
  onConnect: () => void;
  onPickFile: () => void;
}

export function WelcomeScreen({ isSignedIn, busy, errorMessage, onConnect, onPickFile }: WelcomeScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-indigo-400">
        <GoogleDriveIcon width={32} height={32} />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-zinc-100">PDF Slide Writer</h1>
        <p className="max-w-sm text-sm text-zinc-400">
          Annotate PowerPoint slides with your Bluetooth pen, then save straight back to Google Drive.
        </p>
      </div>

      {errorMessage && (
        <p className="max-w-sm rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300">{errorMessage}</p>
      )}

      <button
        type="button"
        onClick={isSignedIn ? onPickFile : onConnect}
        disabled={busy}
        className="flex h-12 items-center gap-2 rounded-xl bg-indigo-500 px-6 text-sm font-medium text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Working…' : isSignedIn ? 'Choose a PDF from Drive' : 'Connect Google Drive'}
      </button>
    </div>
  );
}
