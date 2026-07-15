import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface RenderedPage {
  canvas: HTMLCanvasElement;
  /** Page size in PDF points (1/72"), used to size the exported PDF page. */
  widthPt: number;
  heightPt: number;
}

/**
 * Rasterizes a single PDF page onto a canvas at a resolution suited for
 * crisp display/export on high-DPI iPad screens.
 */
export async function renderPageToCanvas(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  targetScale: number,
): Promise<RenderedPage> {
  const page = await pdf.getPage(pageNumber);
  const unscaledViewport = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: targetScale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not acquire 2D canvas context for PDF rendering.');
  }

  await page.render({ canvas, viewport }).promise;

  return {
    canvas,
    widthPt: unscaledViewport.width,
    heightPt: unscaledViewport.height,
  };
}
