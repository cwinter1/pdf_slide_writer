import { useEffect } from 'react';

interface ShortcutHandlers {
  onUndo: () => void;
  onRedo: () => void;
}

/** Cmd/Ctrl+Z to undo, Cmd/Ctrl+Shift+Z (or Ctrl+Y) to redo. */
export function useKeyboardShortcuts({ onUndo, onRedo }: ShortcutHandlers): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta || e.key.toLowerCase() !== 'z') return;
      e.preventDefault();
      if (e.shiftKey) {
        onRedo();
      } else {
        onUndo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onUndo, onRedo]);
}
