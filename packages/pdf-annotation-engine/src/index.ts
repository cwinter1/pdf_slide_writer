// Configures pdf.js's worker as a side effect, so consumers never have to
// remember to do it themselves.
import './lib/pdfjsSetup';

export * from './types';

export { RASTER_SCALE } from './lib/constants';
export { applyBrushSettings, type BrushSettings } from './lib/brushes';
export { PageHistoryStore, type FabricJSON } from './lib/pageHistory';
export { renderPageToCanvas, type RenderedPage } from './lib/renderPage';

// PDF export (`buildAnnotatedPdf`/`annotatedFileName`) is deliberately NOT
// re-exported here — it pulls in jsPDF, which is heavy and only needed at
// save/export time. Import it from './export' (optionally via a dynamic
// `import()`) so apps that only render/draw don't pay for it upfront.

export { useElementSize, type ElementSize } from './hooks/useElementSize';
export { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
export { usePdfDocument, type PdfDocumentState } from './hooks/usePdfDocument';
export { useSwipeNavigation } from './hooks/useSwipeNavigation';

export { SlideCanvas, type SlideCanvasHandle, type SlideCanvasProps } from './components/SlideCanvas';
export { Toolbar, ToolButton, IconButton, type ToolbarProps } from './components/Toolbar';
export { PageNav } from './components/PageNav';
export * from './components/icons';

export type { PDFDocumentProxy } from 'pdfjs-dist';
