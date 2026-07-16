import { PencilBrush, type Canvas } from 'fabric';
import {
  ERASER_THICKNESS,
  HIGHLIGHTER_COLORS,
  HIGHLIGHTER_WIDTH,
  PEN_COLORS,
  PEN_THICKNESS,
  type EraserThicknessName,
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
  eraserThickness: EraserThicknessName;
}

/**
 * A stroke brush that cuts through previously-drawn ink instead of adding to
 * it, by compositing with `destination-out`. Since the annotation layer is a
 * separate transparent canvas stacked on top of the rasterized PDF page (see
 * SlideCanvas), this only ever erases ink — it can't touch the page content
 * underneath.
 */
class EraserBrush extends PencilBrush {
  createPath(pathData: Parameters<PencilBrush['createPath']>[0]) {
    const path = super.createPath(pathData);
    path.globalCompositeOperation = 'destination-out';
    path.selectable = false;
    path.evented = false;
    return path;
  }
}

/**
 * Configures the Fabric.js canvas' active brush for the given tool. The
 * highlighter uses a translucent stroke so it reads as a highlight rather
 * than an opaque bar over slide text. The eraser is a real drag-to-erase
 * brush with adjustable grades, not a tap-to-delete-whole-stroke tool.
 */
export function applyBrushSettings(canvas: Canvas, settings: BrushSettings): void {
  const brush = settings.tool === 'eraser' ? new EraserBrush(canvas) : new PencilBrush(canvas);

  if (settings.tool === 'highlighter') {
    brush.color = HIGHLIGHTER_COLORS[settings.highlighterColor];
    brush.width = HIGHLIGHTER_WIDTH;
    brush.strokeLineCap = 'square';
  } else if (settings.tool === 'eraser') {
    // Alpha must be fully opaque for destination-out to fully erase; the hue
    // itself is irrelevant since only source alpha affects the composite.
    brush.color = '#000000';
    brush.width = ERASER_THICKNESS[settings.eraserThickness];
    brush.strokeLineCap = 'round';
  } else {
    brush.color = PEN_COLORS[settings.color];
    brush.width = PEN_THICKNESS[settings.thickness];
    brush.strokeLineCap = 'round';
  }

  canvas.freeDrawingBrush = brush;
  canvas.isDrawingMode = true;
}
