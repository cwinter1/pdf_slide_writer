import { jsPDF } from 'jspdf';
import { StaticCanvas } from 'fabric';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { RASTER_SCALE } from './constants';
import type { PageHistoryStore } from './pageHistory';
import { renderPageToCanvas } from './renderPage';

export type ExportProgress = (page: number, totalPages: number) => void;

/**
 * Re-rasterizes every page of the source PDF and composites each page's
 * stored Fabric.js annotations on top, producing a new flattened PDF. Pages
 * the user never visited are rendered fresh here (their history store entry
 * is simply empty, so no overlay is drawn).
 */
export async function buildAnnotatedPdf(
  pdf: PDFDocumentProxy,
  historyStore: PageHistoryStore,
  onProgress?: ExportProgress,
): Promise<Blob> {
  const numPages = pdf.numPages;
  let doc: jsPDF | null = null;

  for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
    const { canvas: raster, widthPt, heightPt } = await renderPageToCanvas(pdf, pageNumber, RASTER_SCALE);

    const snapshot = historyStore.getCurrentSnapshot(pageNumber);
    if (snapshot) {
      const overlay = new StaticCanvas(undefined, {
        width: raster.width,
        height: raster.height,
        enableRetinaScaling: false,
      });
      await overlay.loadFromJSON(snapshot);
      overlay.renderAll();
      raster.getContext('2d')?.drawImage(overlay.getElement(), 0, 0);
      overlay.dispose();
    }

    const orientation = widthPt >= heightPt ? 'landscape' : 'portrait';
    if (!doc) {
      doc = new jsPDF({ orientation, unit: 'pt', format: [widthPt, heightPt] });
    } else {
      doc.addPage([widthPt, heightPt], orientation);
    }
    doc.addImage(raster, 'JPEG', 0, 0, widthPt, heightPt, undefined, 'MEDIUM');

    onProgress?.(pageNumber, numPages);
  }

  if (!doc) {
    throw new Error('The PDF has no pages to export.');
  }

  return doc.output('blob');
}

/** Derives "My Deck.pdf" -> "My Deck (annotated).pdf" for the "save a copy" flow. */
export function annotatedFileName(originalName: string): string {
  const match = /^(.*?)(\.pdf)?$/i.exec(originalName);
  const base = match?.[1] || originalName;
  return `${base} (annotated).pdf`;
}
