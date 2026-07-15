export type ToolType = 'pen' | 'highlighter' | 'eraser';

export type PenColorName = 'black' | 'blue' | 'red';

export type PenThicknessName = 'thin' | 'medium' | 'thick';

export const PEN_COLORS: Record<PenColorName, string> = {
  black: '#111111',
  blue: '#1a56db',
  red: '#dc2626',
};

export const PEN_THICKNESS: Record<PenThicknessName, number> = {
  thin: 2,
  medium: 4,
  thick: 6,
};

export const HIGHLIGHTER_COLOR = 'rgba(255, 224, 0, 0.4)';
export const HIGHLIGHTER_WIDTH = 18;

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export interface PageAnnotationState {
  /** Serialized Fabric.js canvas JSON for this page, or null if untouched. */
  json: object | null;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
