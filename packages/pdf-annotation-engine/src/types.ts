export type ToolType = 'pen' | 'highlighter' | 'eraser';

export type PenColorName = 'black' | 'blue' | 'red';

export type PenThicknessName = 'thin' | 'medium' | 'thick';

export type HighlighterColorName = 'yellow' | 'green' | 'blue';

export type EraserThicknessName = 'thin' | 'medium' | 'thick';

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

/** Translucent stroke colors the highlighter draws with, so it reads as a highlight over slide text rather than an opaque bar. */
export const HIGHLIGHTER_COLORS: Record<HighlighterColorName, string> = {
  yellow: 'rgba(234, 179, 8, 0.4)',
  green: 'rgba(34, 197, 94, 0.4)',
  blue: 'rgba(59, 130, 246, 0.4)',
};

/** Solid versions of `HIGHLIGHTER_COLORS`, used for the toolbar's color swatch buttons. */
export const HIGHLIGHTER_SWATCHES: Record<HighlighterColorName, string> = {
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
};

export const HIGHLIGHTER_WIDTH = 18;

/** Eraser stroke widths, in px — bigger grades cover more area per pass. */
export const ERASER_THICKNESS: Record<EraserThicknessName, number> = {
  thin: 12,
  medium: 24,
  thick: 40,
};
