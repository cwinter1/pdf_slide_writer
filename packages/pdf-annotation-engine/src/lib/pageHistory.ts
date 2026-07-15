export type FabricJSON = Record<string, unknown>;

interface PageEntry {
  entries: FabricJSON[];
  /** Index of the currently active entry; -1 means the page has no strokes. */
  pointer: number;
}

/**
 * Per-page undo/redo stacks, keyed by page number. Each entry is a full
 * Fabric.js canvas JSON snapshot (objects only — the PDF raster is kept out
 * of Fabric entirely, so these snapshots stay small).
 */
export class PageHistoryStore {
  private pages = new Map<number, PageEntry>();

  private ensure(page: number): PageEntry {
    let entry = this.pages.get(page);
    if (!entry) {
      entry = { entries: [], pointer: -1 };
      this.pages.set(page, entry);
    }
    return entry;
  }

  push(page: number, snapshot: FabricJSON): void {
    const entry = this.ensure(page);
    entry.entries = entry.entries.slice(0, entry.pointer + 1);
    entry.entries.push(snapshot);
    entry.pointer = entry.entries.length - 1;
  }

  /** Returns the JSON to restore (or null for an empty canvas). Caller must check canUndo first. */
  undo(page: number): FabricJSON | null {
    const entry = this.ensure(page);
    entry.pointer -= 1;
    return entry.pointer >= 0 ? entry.entries[entry.pointer] : null;
  }

  /** Returns the JSON to restore. Caller must check canRedo first. */
  redo(page: number): FabricJSON | null {
    const entry = this.ensure(page);
    entry.pointer += 1;
    return entry.entries[entry.pointer];
  }

  canUndo(page: number): boolean {
    return this.ensure(page).pointer >= 0;
  }

  canRedo(page: number): boolean {
    const entry = this.ensure(page);
    return entry.pointer < entry.entries.length - 1;
  }

  /** The JSON that should currently be loaded for this page, or null if it has no strokes. */
  getCurrentSnapshot(page: number): FabricJSON | null {
    const entry = this.ensure(page);
    return entry.pointer >= 0 ? entry.entries[entry.pointer] : null;
  }
}
