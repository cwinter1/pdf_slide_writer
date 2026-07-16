import { PencilBrush, type Canvas } from 'fabric';
import {
  HIGHLIGHTER_COLORS,
  HIGHLIGHTER_WIDTH,
  PEN_COLORS,
  PEN_THICKNESS,
  type HighlighterColorName,
  type PenColorName,
  type PenThicknessName,
  type ToolType,
} from '../types';

export interface BrushSettings {
  tool: ToolType;
  color: PenColorName;
  thickness: PenThicknessName;
  highlighterColor: HighlighterColorName;
}

/**
 * Configures the Fabric.js canvas' active brush for the given tool. The
 * highlighter uses a translucent stroke so it reads as a highlight rather
 * than an opaque bar over slide text.
 */
export function applyBrushSettings(canvas: Canvas, settings: BrushSettings): void {
  if (settings.tool === 'eraser') {
    canvas.isDrawingMode = false;
    return;
  }

  const brush = new PencilBrush(canvas);

  if (settings.tool === 'highlighter') {
    brush.color = HIGHLIGHTER_COLORS[settings.highlighterColor];
    brush.width = HIGHLIGHTER_WIDTH;
    brush.strokeLineCap = 'square';
  } else {
    brush.color = PEN_COLORS[settings.color];
    brush.width = PEN_THICKNESS[settings.thickness];
    brush.strokeLineCap = 'round';
  }

  canvas.freeDrawingBrush = brush;
  canvas.isDrawingMode = true;
}
