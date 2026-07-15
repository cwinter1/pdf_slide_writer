import { IconButton, Toolbar, type ToolbarProps } from '@pdf-slide-writer/annotation-engine';
import type { SaveStatus } from '../types';
import { DownloadIcon, FolderIcon, LogoutIcon, SaveIcon } from './icons';

interface AppToolbarProps extends Omit<ToolbarProps, 'leading' | 'trailing'> {
  fileName: string;
  saveStatus: SaveStatus;
  onSave: () => void;
  onSaveCopy: () => void;
  onDownload: () => void;
  onChangeFile: () => void;
  onSignOut: () => void;
}

const SAVE_STATUS_LABEL: Record<SaveStatus, string> = {
  idle: 'Save to Drive',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Retry save',
};

/**
 * Wraps the engine's storage-agnostic `Toolbar` with this app's Google
 * Drive-specific file/save/download/sign-out controls, composed in via the
 * `leading`/`trailing` slots so the engine itself stays unaware of Drive.
 */
export function AppToolbar({
  fileName,
  saveStatus,
  onSave,
  onSaveCopy,
  onDownload,
  onChangeFile,
  onSignOut,
  ...toolbarProps
}: AppToolbarProps) {
  return (
    <Toolbar
      {...toolbarProps}
      leading={
        <div className="flex min-w-0 items-center gap-2 pr-2">
          <button
            type="button"
            onClick={onChangeFile}
            title="Choose a different file"
            className="flex h-11 items-center gap-2 truncate rounded-lg bg-zinc-800 px-3 text-sm text-zinc-200 hover:bg-zinc-700"
          >
            <FolderIcon width={18} height={18} />
            <span className="max-w-40 truncate sm:max-w-64">{fileName}</span>
          </button>
        </div>
      }
      trailing={
        <>
          <button
            type="button"
            onClick={onDownload}
            title="Download a copy to this device"
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          >
            <DownloadIcon />
          </button>
          <button
            type="button"
            onClick={onSaveCopy}
            title="Save a copy to Drive"
            className="hidden h-11 items-center rounded-lg bg-zinc-800 px-3 text-sm text-zinc-200 hover:bg-zinc-700 sm:flex"
          >
            Save a copy
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            title="Save to Drive"
            className="flex h-11 items-center gap-2 rounded-lg bg-indigo-500 px-3 text-sm font-medium text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SaveIcon width={18} height={18} />
            {SAVE_STATUS_LABEL[saveStatus]}
          </button>
          <IconButton label="Sign out" onClick={onSignOut}>
            <LogoutIcon />
          </IconButton>
        </>
      }
    />
  );
}
