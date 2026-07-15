import { useCallback, useMemo, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  PageHistoryStore,
  SlideCanvas,
  PageNav,
  usePdfDocument,
  useKeyboardShortcuts,
  useSwipeNavigation,
  type SlideCanvasHandle,
  type PenColorName,
  type PenThicknessName,
  type ToolType,
} from '@pdf-slide-writer/annotation-engine';
import { downloadFile, updateFileContent, createFile, listPdfFiles } from './lib/googleDrive';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { AppToolbar } from './components/AppToolbar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { DriveFilePickerModal } from './components/DriveFilePickerModal';
import type { DriveFile, SaveStatus } from './types';

function App() {
  const googleAuth = useGoogleAuth();

  const [driveFile, setDriveFile] = useState<DriveFile | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [busy, setBusy] = useState(false);
  const [welcomeError, setWelcomeError] = useState<string | null>(null);
  const [pickerFiles, setPickerFiles] = useState<DriveFile[] | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [tool, setTool] = useState<ToolType>('pen');
  const [color, setColor] = useState<PenColorName>('black');
  const [thickness, setThickness] = useState<PenThicknessName>('medium');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const historyStoreRef = useRef(new PageHistoryStore());
  const slideCanvasRef = useRef<SlideCanvasHandle>(null);
  const swipeAreaRef = useRef<HTMLDivElement>(null);

  const pdfState = usePdfDocument(pdfBytes);

  const resetDocument = useCallback(() => {
    setDriveFile(null);
    setPdfBytes(null);
    setCurrentPage(1);
    setSaveStatus('idle');
    historyStoreRef.current = new PageHistoryStore();
  }, []);

  const handleConnect = useCallback(async () => {
    setWelcomeError(null);
    setBusy(true);
    try {
      await googleAuth.signIn();
    } catch (err) {
      setWelcomeError(err instanceof Error ? err.message : 'Could not connect to Google Drive.');
    } finally {
      setBusy(false);
    }
  }, [googleAuth]);

  const handlePickFile = useCallback(async () => {
    setWelcomeError(null);
    setBusy(true);
    try {
      const token = await googleAuth.ensureAccessToken();
      const files = await listPdfFiles(token);
      setPickerFiles(files);
    } catch (err) {
      setWelcomeError(err instanceof Error ? err.message : 'Could not list Drive files.');
    } finally {
      setBusy(false);
    }
  }, [googleAuth]);

  const handleSelectDriveFile = useCallback(
    async (picked: DriveFile) => {
      setPickerFiles(null);
      setWelcomeError(null);
      setBusy(true);
      try {
        const token = await googleAuth.ensureAccessToken();
        const bytes = await downloadFile(picked.id, token);
        historyStoreRef.current = new PageHistoryStore();
        setDriveFile(picked);
        setPdfBytes(bytes);
        setCurrentPage(1);
        setSaveStatus('idle');
      } catch (err) {
        setWelcomeError(err instanceof Error ? err.message : 'Could not open that file.');
      } finally {
        setBusy(false);
      }
    },
    [googleAuth],
  );

  const handleUndo = useCallback(() => slideCanvasRef.current?.undo(), []);
  const handleRedo = useCallback(() => slideCanvasRef.current?.redo(), []);
  useKeyboardShortcuts({ onUndo: handleUndo, onRedo: handleRedo });

  const numPages = pdfState.pdf?.numPages ?? 0;
  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage((prev) => {
        const next = Math.min(Math.max(page, 1), Math.max(numPages, 1));
        return next === prev ? prev : next;
      });
    },
    [numPages],
  );
  const goPrev = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);
  const goNext = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
  useSwipeNavigation(swipeAreaRef, { onSwipeLeft: goNext, onSwipeRight: goPrev });

  // jsPDF (and its heavy transitive deps) are only needed once the user
  // actually exports, so they're kept out of the initial bundle.
  const exportPdf = useCallback(async () => {
    if (!pdfState.pdf) throw new Error('No PDF loaded.');
    const { buildAnnotatedPdf } = await import('@pdf-slide-writer/annotation-engine/export');
    return buildAnnotatedPdf(pdfState.pdf, historyStoreRef.current);
  }, [pdfState.pdf]);

  const handleDownload = useCallback(async () => {
    try {
      const blob = await toast.promise(exportPdf(), {
        loading: 'Preparing PDF…',
        success: 'PDF ready.',
        error: (err) => (err instanceof Error ? err.message : 'Failed to build PDF.'),
      });
      const { annotatedFileName } = await import('@pdf-slide-writer/annotation-engine/export');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = annotatedFileName(driveFile?.name ?? 'slides.pdf');
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // toast.promise already surfaced the error
    }
  }, [exportPdf, driveFile]);

  const handleSave = useCallback(
    async (asCopy: boolean) => {
      if (!driveFile) return;
      setSaveStatus('saving');
      try {
        const blob = await exportPdf();
        const { annotatedFileName } = await import('@pdf-slide-writer/annotation-engine/export');
        const token = await googleAuth.ensureAccessToken();
        if (asCopy) {
          const created = await createFile(token, annotatedFileName(driveFile.name), blob);
          toast.success(`Saved a copy: ${created.name}`);
        } else {
          await updateFileContent(driveFile.id, token, blob);
          toast.success('Saved to Drive.');
        }
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus((s) => (s === 'saved' ? 'idle' : s)), 2500);
      } catch (err) {
        setSaveStatus('error');
        toast.error(err instanceof Error ? err.message : 'Failed to save to Drive.');
      }
    },
    [driveFile, exportPdf, googleAuth],
  );

  const handleHistoryChange = useCallback((undo: boolean, redo: boolean) => {
    setCanUndo(undo);
    setCanRedo(redo);
  }, []);

  const handleCanvasError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const isEditorReady = useMemo(
    () => Boolean(driveFile && pdfState.pdf && !pdfState.loading),
    [driveFile, pdfState.pdf, pdfState.loading],
  );

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      <Toaster position="top-center" toastOptions={{ style: { background: '#27272a', color: '#f4f4f5' } }} />

      {pickerFiles && (
        <DriveFilePickerModal
          files={pickerFiles}
          onSelect={handleSelectDriveFile}
          onCancel={() => setPickerFiles(null)}
        />
      )}

      {!isEditorReady ? (
        <WelcomeScreen
          isSignedIn={googleAuth.isSignedIn}
          busy={busy || pdfState.loading}
          errorMessage={welcomeError ?? pdfState.error}
          onConnect={handleConnect}
          onPickFile={handlePickFile}
        />
      ) : (
        <>
          <AppToolbar
            tool={tool}
            color={color}
            thickness={thickness}
            onToolChange={setTool}
            onColorChange={setColor}
            onThicknessChange={setThickness}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            fileName={driveFile?.name ?? 'Untitled.pdf'}
            saveStatus={saveStatus}
            onSave={() => handleSave(false)}
            onSaveCopy={() => handleSave(true)}
            onDownload={handleDownload}
            onChangeFile={resetDocument}
            onSignOut={() => {
              resetDocument();
              googleAuth.signOut();
            }}
          />
          <div ref={swipeAreaRef} className="min-h-0 flex-1">
            {pdfState.pdf && (
              <SlideCanvas
                ref={slideCanvasRef}
                pdf={pdfState.pdf}
                pageNumber={currentPage}
                tool={tool}
                color={color}
                thickness={thickness}
                historyStore={historyStoreRef.current}
                onHistoryChange={handleHistoryChange}
                onError={handleCanvasError}
              />
            )}
          </div>
          <PageNav currentPage={currentPage} numPages={numPages} onPrev={goPrev} onNext={goNext} />
        </>
      )}
    </div>
  );
}

export default App;
