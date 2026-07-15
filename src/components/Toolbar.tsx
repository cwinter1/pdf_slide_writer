import type { PenColorName, PenThicknessName, SaveStatus, ToolType } from '../types';
import { PEN_COLORS } from '../types';
import {
  DownloadIcon,
  EraserIcon,
  FolderIcon,
  HighlighterIcon,
  LogoutIcon,
  PenIcon,
  RedoIcon,
  SaveIcon,
  UndoIcon,
} from './icons';

interface ToolbarProps {
  tool: ToolType;
  color: PenColorName;
  thickness: PenThicknessName;
  onToolChange: (tool: ToolType) => void;
  onColorChange: (color: PenColorName) => void;
  onThicknessChange: (thickness: PenThicknessName) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  fileName: string;
  saveStatus: SaveStatus;
  onSave: () => void;
  onSaveCopy: () => void;
  onDownload: () => void;
  onChangeFile: () => void;
  onSignOut: () => void;
}

const THICKNESS_ORDER: PenThicknessName[] = ['thin', 'medium', 'thick'];
const COLOR_ORDER: PenColorName[] = ['black', 'blue', 'red'];

function ToolButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors ${
        active ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
      }`}
    >
      {children}
    </button>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

const SAVE_STATUS_LABEL: Record<SaveStatus, string> = {
  idle: 'Save to Drive',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Retry save',
};

export function Toolbar(props: ToolbarProps) {
  const {
    tool,
    color,
    thickness,
    onToolChange,
    onColorChange,
    onThicknessChange,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    fileName,
    saveStatus,
    onSave,
    onSaveCopy,
    onDownload,
    onChangeFile,
    onSignOut,
  } = props;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-2 py-2 sm:px-3">
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

      <div className="flex items-center gap-1">
        <ToolButton active={tool === 'pen'} label="Pen" onClick={() => onToolChange('pen')}>
          <PenIcon />
        </ToolButton>
        <ToolButton active={tool === 'highlighter'} label="Highlighter" onClick={() => onToolChange('highlighter')}>
          <HighlighterIcon />
        </ToolButton>
        <ToolButton active={tool === 'eraser'} label="Eraser (tap a stroke to remove it)" onClick={() => onToolChange('eraser')}>
          <EraserIcon />
        </ToolButton>
      </div>

      {tool === 'pen' && (
        <>
          <div className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-2 py-1.5" role="group" aria-label="Pen color">
            {COLOR_ORDER.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onColorChange(c)}
                aria-label={`${c} pen`}
                aria-pressed={color === c}
                className={`h-8 w-8 rounded-full ring-offset-2 ring-offset-zinc-800 transition-shadow ${
                  color === c ? 'ring-2 ring-white' : ''
                }`}
                style={{ backgroundColor: PEN_COLORS[c] }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-zinc-800 px-1.5 py-1.5" role="group" aria-label="Pen thickness">
            {THICKNESS_ORDER.map((t, i) => (
              <button
                key={t}
                type="button"
                onClick={() => onThicknessChange(t)}
                aria-label={`${t} thickness`}
                aria-pressed={thickness === t}
                className={`flex h-8 w-9 items-center justify-center rounded-md transition-colors ${
                  thickness === t ? 'bg-indigo-500' : 'hover:bg-zinc-700'
                }`}
              >
                <span
                  className="rounded-full bg-white"
                  style={{ width: 8 + i * 5, height: 8 + i * 5 }}
                />
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex items-center gap-1">
        <IconButton label="Undo" onClick={onUndo} disabled={!canUndo}>
          <UndoIcon />
        </IconButton>
        <IconButton label="Redo" onClick={onRedo} disabled={!canRedo}>
          <RedoIcon />
        </IconButton>
      </div>

      <div className="ml-auto flex items-center gap-2">
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
      </div>
    </div>
  );
}
