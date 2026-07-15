// Separate entry point so consumers only pull in jsPDF (and its heavy
// transitive deps) when they actually need to export a PDF — typically via
// `await import('@pdf-slide-writer/annotation-engine/export')` — rather than
// as part of the main entry point's render/draw bundle.
export { buildAnnotatedPdf, annotatedFileName, type ExportProgress } from './lib/pdfExport';
