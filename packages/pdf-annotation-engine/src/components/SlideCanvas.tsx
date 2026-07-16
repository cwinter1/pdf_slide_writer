import { Canvas as FabricCanvas } from 'fabric';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { applyBrushSettings } from '../lib/brushes';
import { RASTER_SCALE } from '../lib/constants';
import type { PageHistoryStore } from '../lib/pageHistory';
import { renderPageToCanvas } from '../lib/renderPage';
import { useElementSize } from '../hooks/useElementSize';
import type { EraserThicknessName, HighlighterColorName, PenColorName, PenThicknessName, ToolType } from '../types';

export interface SlideCanvasProps {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  tool: ToolType;
  color: PenColorName;
  thickness: PenThicknessName;
  highlighterColor: HighlighterColorName;
  eraserThickness: EraserThicknessName;
  historyStore: PageHistoryStore;
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
  onError: (message: string) => void;
}

export interface SlideCanvasHandle {
  undo: () => void;
  redo: () => void;
}

export const SlideCanvas = forwardRef<SlideCanvasHandle, SlideCanvasProps>(function SlideCanvas(
  { pdf, pageNumber, tool, color, thickness, highlighterColor, eraserThickness, historyStore, onHistoryChange, onError },
  ref,
) {
  const [containerRef, containerSize] = useElementSize<HTMLDivElement>();
  const bgCanvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const restoringRef = useRef(false);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });

  // The Fabric canvas and its event listeners are created once (see the
  // mount effect below) and must always act on whatever page is active at
  // the moment a stroke/erase happens, not whatever page was active when
  // the listener was registered — so reads go through this ref rather than
  // closing over the `pageNumber` prop directly.
  const pageNumberRef = useRef(pageNumber);
  pageNumberRef.current = pageNumber;

  const reportHistory = (page: number) => {
    onHistoryChange(historyStore.canUndo(page), historyStore.canRedo(page));
  };

  const pushHistory = () => {
    const canvas = fabricRef.current;
    if (!canvas || restoringRef.current) return;
    const page = pageNumberRef.current;
    historyStore.push(page, canvas.toJSON());
    reportHistory(page);
  };

  const restoreSnapshot = (snapshot: object | null) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    restoringRef.current = true;
    const done = () => {
      canvas.requestRenderAll();
      restoringRef.current = false;
    };
    if (snapshot) {
      canvas.loadFromJSON(snapshot).then(done).catch(done);
    } else {
      canvas.clear();
      done();
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      undo: () => {
        if (!historyStore.canUndo(pageNumber)) return;
        restoreSnapshot(historyStore.undo(pageNumber));
        reportHistory(pageNumber);
      },
      redo: () => {
        if (!historyStore.canRedo(pageNumber)) return;
        restoreSnapshot(historyStore.redo(pageNumber));
        reportHistory(pageNumber);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageNumber],
  );

  // Create the Fabric canvas once.
  useEffect(() => {
    const el = fabricElRef.current;
    if (!el) return;

    const canvas = new FabricCanvas(el, {
      selection: false,
      allowTouchScrolling: true,
      containerClass: 'fabric-overlay',
    });
    fabricRef.current = canvas;

    const handlePathCreated = () => pushHistory();
    canvas.on('path:created', handlePathCreated);

    return () => {
      canvas.off('path:created', handlePathCreated);
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply tool/color/thickness. The eraser is itself a drawing brush (see
  // brushes.ts) that cuts through existing strokes, so no separate
  // tap-to-delete handling is needed here.
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    applyBrushSettings(canvas, { tool, color, thickness, highlighterColor, eraserThickness });
    canvas.selection = false;
    canvas.forEachObject((obj) => {
      obj.selectable = false;
      obj.evented = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, color, thickness, highlighterColor, eraserThickness]);

  // Load the current page's raster + stored annotations whenever the page changes.
  useEffect(() => {
    let cancelled = false;
    const canvas = fabricRef.current;
    const bgCanvas = bgCanvasElRef.current;
    if (!canvas || !bgCanvas) return;

    renderPageToCanvas(pdf, pageNumber, RASTER_SCALE)
      .then(({ canvas: rendered }) => {
        if (cancelled) return;

        bgCanvas.width = rendered.width;
        bgCanvas.height = rendered.height;
        const ctx = bgCanvas.getContext('2d');
        ctx?.drawImage(rendered, 0, 0);

        // backstoreOnly: the "fit" effect below owns CSS sizing, so this
        // only updates the logical coordinate space objects are drawn in.
        canvas.setDimensions({ width: rendered.width, height: rendered.height }, { backstoreOnly: true });
        restoreSnapshot(historyStore.getCurrentSnapshot(pageNumber));
        reportHistory(pageNumber);
        setPageSize({ width: rendered.width, height: rendered.height });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          onError(err instanceof Error ? err.message : 'Failed to render this page.');
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdf, pageNumber]);

  // Fit the slide inside the available viewport while preserving its aspect ratio.
  const scale =
    pageSize.width && pageSize.height && containerSize.width && containerSize.height
      ? Math.min(containerSize.width / pageSize.width, containerSize.height / pageSize.height)
      : 0;
  const displayW = scale ? Math.floor(pageSize.width * scale) : 0;
  const displayH = scale ? Math.floor(pageSize.height * scale) : 0;

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !displayW || !displayH) return;
    canvas.setDimensions({ width: displayW, height: displayH }, { cssOnly: true });
  }, [displayW, displayH]);

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="annotation-surface relative rounded-sm bg-white shadow-2xl"
        style={{ width: displayW || undefined, height: displayH || undefined }}
      >
        <canvas ref={bgCanvasElRef} className="absolute left-0 top-0 h-full w-full" />
        <canvas ref={fabricElRef} />
      </div>
    </div>
  );
});
