import { useEffect, useState } from 'react';
import { getDocument, type PDFDocumentProxy } from 'pdfjs-dist';

export interface PdfDocumentState {
  pdf: PDFDocumentProxy | null;
  loading: boolean;
  error: string | null;
}

/** Loads a PDF.js document from raw bytes and disposes it when the bytes change or the component unmounts. */
export function usePdfDocument(data: ArrayBuffer | null): PdfDocumentState {
  const [state, setState] = useState<PdfDocumentState>({ pdf: null, loading: false, error: null });

  useEffect(() => {
    if (!data) {
      setState({ pdf: null, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState({ pdf: null, loading: true, error: null });

    const loadingTask = getDocument({ data: data.slice(0) });
    loadingTask.promise
      .then((pdf) => {
        if (cancelled) return;
        setState({ pdf, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            pdf: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load PDF.',
          });
        }
      });

    return () => {
      cancelled = true;
      loadingTask.destroy();
    };
  }, [data]);

  return state;
}
