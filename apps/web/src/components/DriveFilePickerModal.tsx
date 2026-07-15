import type { DriveFile } from '../types';
import { GoogleDriveIcon } from './icons';

interface DriveFilePickerModalProps {
  files: DriveFile[];
  onSelect: (file: DriveFile) => void;
  onCancel: () => void;
}

export function DriveFilePickerModal({ files, onSelect, onCancel }: DriveFilePickerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-zinc-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h2 className="text-sm font-medium text-zinc-100">Select a PDF</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-zinc-400 hover:text-zinc-200"
          >
            Cancel
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {files.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-zinc-400">
              No PDFs found in your Drive.
            </p>
          ) : (
            <ul>
              {files.map((file) => (
                <li key={file.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(file)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                  >
                    <GoogleDriveIcon width={18} height={18} className="shrink-0 text-indigo-400" />
                    <span className="truncate">{file.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
