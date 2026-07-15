import type { ReactNode } from 'react';
import type { PenColorName, PenThicknessName, ToolType } from '../types';
import { PEN_COLORS } from '../types';
import { EraserIcon, HighlighterIcon, PenIcon, RedoIcon, UndoIcon } from './icons';

export interface ToolbarProps {
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
  /** Rendered first, e.g. a file name / open-file control from the host app. */
  leading?: ReactNode;
  /** Rendered last and pushed to the right, e.g. the host app's save/export actions. */
  trailing?: ReactNode;
}

const THICKNESS_ORDER: PenThicknessName[] = ['thin', 'medium', 'thick'];
const COLOR_ORDER: PenColorName[] = ['black', 'blue', 'red'];

/** A toggleable square icon button, styled for the drawing tool switcher. Exported for reuse by host-app toolbars. */
export function ToolButton({
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

/** A plain square icon button (non-toggling), styled to match the toolbar. Exported for reuse by host-app toolbars. */
export function IconButton({
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

/**
 * The drawing toolbar: tool switcher, pen color/thickness, undo/redo. Deliberately
 * storage-agnostic — file/save/export controls are composed in via `leading`/`trailing`
 * by the host app so this component has no knowledge of where files come from.
 */
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
    leading,
    trailing,
  } = props;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-2 py-2 sm:px-3">
      {leading}

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
                <span className="rounded-full bg-white" style={{ width: 8 + i * 5, height: 8 + i * 5 }} />
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

      {trailing && <div className="ml-auto flex items-center gap-2">{trailing}</div>}
    </div>
  );
}
