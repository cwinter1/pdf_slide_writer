# @pdf-slide-writer/annotation-engine

A storage-agnostic PDF annotation engine for React: pdf.js rendering, a
Fabric.js pen/highlighter/eraser drawing layer, per-page undo/redo, and PDF
export/merge. It knows nothing about where a PDF comes from or where it
goes — bring your own file source (Google Drive, S3, a local file input,
whatever) and wire it up around the pieces below.

This package was extracted from [`apps/web`](../../apps/web), the Google
Drive + iPad app in this repo, so the `apps/web` source is also a working
usage example end to end.

## Install (within this workspace)

```bash
npm install @pdf-slide-writer/annotation-engine@^0.1.0 --workspace=<your-app>
```

`react` and `react-dom` (`^19.0.0`) are peer dependencies — the host app
supplies them.

## Setup

Import the package's stylesheet once, near your app's entry point (it just
contains the one CSS rule `SlideCanvas` needs — see [Notes](#notes)):

```ts
import '@pdf-slide-writer/annotation-engine/styles.css';
```

The pdf.js worker is configured automatically as a side effect of
importing anything from the package — nothing else to set up.

## Quick start

```tsx
import { useRef, useState } from 'react';
import {
  PageHistoryStore,
  SlideCanvas,
  Toolbar,
  PageNav,
  usePdfDocument,
  useKeyboardShortcuts,
  type SlideCanvasHandle,
  type ToolType,
  type PenColorName,
  type PenThicknessName,
  type HighlighterColorName,
} from '@pdf-slide-writer/annotation-engine';

function Editor({ pdfBytes }: { pdfBytes: ArrayBuffer }) {
  const { pdf } = usePdfDocument(pdfBytes);
  const historyStore = useRef(new PageHistoryStore()).current;
  const canvasRef = useRef<SlideCanvasHandle>(null);

  const [page, setPage] = useState(1);
  const [tool, setTool] = useState<ToolType>('pen');
  const [color, setColor] = useState<PenColorName>('black');
  const [thickness, setThickness] = useState<PenThicknessName>('medium');
  const [highlighterColor, setHighlighterColor] = useState<HighlighterColorName>('yellow');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useKeyboardShortcuts({
    onUndo: () => canvasRef.current?.undo(),
    onRedo: () => canvasRef.current?.redo(),
  });

  if (!pdf) return null;

  return (
    <>
      <Toolbar
        tool={tool}
        color={color}
        thickness={thickness}
        highlighterColor={highlighterColor}
        onToolChange={setTool}
        onColorChange={setColor}
        onThicknessChange={setThickness}
        onHighlighterColorChange={setHighlighterColor}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => canvasRef.current?.undo()}
        onRedo={() => canvasRef.current?.redo()}
      />
      <SlideCanvas
        ref={canvasRef}
        pdf={pdf}
        pageNumber={page}
        tool={tool}
        color={color}
        thickness={thickness}
        highlighterColor={highlighterColor}
        historyStore={historyStore}
        onHistoryChange={(undo, redo) => {
          setCanUndo(undo);
          setCanRedo(redo);
        }}
        onError={(message) => console.error(message)}
      />
      <PageNav
        currentPage={page}
        numPages={pdf.numPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(pdf.numPages, p + 1))}
      />
    </>
  );
}
```

When the user wants to export, pull in `buildAnnotatedPdf` from the
separate `/export` entry point (see [Code splitting](#code-splitting-the-export-path)):

```ts
const { buildAnnotatedPdf } = await import('@pdf-slide-writer/annotation-engine/export');
const blob = await buildAnnotatedPdf(pdf, historyStore);
```

## API reference

### Components

#### `<SlideCanvas />`

The core drawing surface: rasterizes one PDF page and layers a Fabric.js
canvas on top for strokes. Renders responsively to fill its container while
preserving the page's aspect ratio.

| Prop | Type | Description |
|---|---|---|
| `pdf` | `PDFDocumentProxy` | The loaded pdf.js document (from `usePdfDocument` or `pdfjs-dist` directly). |
| `pageNumber` | `number` | 1-indexed page to display. |
| `tool` | `ToolType` | `'pen' \| 'highlighter' \| 'eraser'`. |
| `color` | `PenColorName` | Pen color; ignored for highlighter/eraser. |
| `thickness` | `PenThicknessName` | Pen thickness; ignored for highlighter/eraser. |
| `highlighterColor` | `HighlighterColorName` | Highlighter color (`'yellow' \| 'green' \| 'blue'`); ignored for pen/eraser. |
| `historyStore` | `PageHistoryStore` | Shared across the whole document — one instance per open PDF, not per page. |
| `onHistoryChange` | `(canUndo: boolean, canRedo: boolean) => void` | Fired whenever the current page's undo/redo availability changes (including on page switch). |
| `onError` | `(message: string) => void` | Fired if a page fails to render. |

Imperative handle (via `ref`, typed `SlideCanvasHandle`):

- `undo(): void`
- `redo(): void`

`SlideCanvasProps` is also exported if you need to type a wrapper.

#### `<Toolbar />`

The drawing toolbar: tool switcher, pen color/thickness swatches, highlighter
color swatches, undo/redo.
Deliberately has no concept of files, saving, or export — compose your own
controls in via `leading`/`trailing`, which render before/after (right-
aligned) the drawing controls:

```tsx
<Toolbar {...toolbarProps} leading={<MyFileMenu />} trailing={<MySaveButton />} />
```

`ToolButton` and `IconButton` (the toggle/plain square icon-button
primitives `Toolbar` is built from) are also exported so a host app's
`leading`/`trailing` content can match the toolbar's look — see
[`apps/web`'s `AppToolbar`](../../apps/web/src/components/AppToolbar.tsx)
for a full example of wrapping `Toolbar` with app-specific save/download/
sign-out actions this way.

#### `<PageNav />`

Prev/next buttons plus a "current / total" indicator.

| Prop | Type |
|---|---|
| `currentPage` | `number` |
| `numPages` | `number` |
| `onPrev` | `() => void` |
| `onNext` | `() => void` |

#### Icons

`PenIcon`, `HighlighterIcon`, `EraserIcon`, `UndoIcon`, `RedoIcon`,
`ChevronLeftIcon`, `ChevronRightIcon` — the small inline SVG icon set
`Toolbar`/`PageNav` use internally, exported in case a host app wants
visual consistency in its own composed controls. Each accepts standard
`SVGProps<SVGSVGElement>`.

### Hooks

- **`usePdfDocument(data: ArrayBuffer | null): PdfDocumentState`** — loads
  a pdf.js document from raw bytes, disposing it on unmount or when `data`
  changes. Returns `{ pdf, loading, error }`.
- **`useKeyboardShortcuts({ onUndo, onRedo })`** — binds Cmd/Ctrl+Z and
  Cmd/Ctrl+Shift+Z globally.
- **`useSwipeNavigation(ref, { onSwipeLeft, onSwipeRight })`** — recognizes
  a **two-finger** horizontal swipe on the given element for page
  navigation (deliberately two-finger so it never competes with
  single-finger/pen drawing).
- **`useElementSize<T>(): [ref, { width, height }]`** — tracks an element's
  content-box size via `ResizeObserver`. `SlideCanvas` uses this
  internally to fit the page to its container; exported in case a host
  app wants the same behavior elsewhere.

### `PageHistoryStore`

Per-page undo/redo stacks, keyed by page number. Create **one instance per
open document** (not per page) and pass it to every `SlideCanvas` render
for that document — `SlideCanvas` reads/writes it directly as the user
draws, and `buildAnnotatedPdf` reads it at export time.

```ts
new PageHistoryStore()
```

| Method | Description |
|---|---|
| `push(page, snapshot)` | Records a new state for a page, truncating any redo history past the current pointer. |
| `undo(page)` / `redo(page)` | Moves the pointer and returns the snapshot to restore (or `null` for an empty canvas). Check `canUndo`/`canRedo` first. |
| `canUndo(page)` / `canRedo(page)` | `boolean`. |
| `getCurrentSnapshot(page)` | The snapshot that should currently be loaded for a page, or `null` if it has no strokes — this is what `buildAnnotatedPdf` reads per page. |

`FabricJSON` (`Record<string, unknown>`) is the snapshot type — a Fabric.js
canvas JSON payload containing only the drawn objects, never the page
raster, so snapshots stay small.

### PDF rendering & export

- **`renderPageToCanvas(pdf, pageNumber, targetScale): Promise<RenderedPage>`**
  — rasterizes one page onto a fresh `<canvas>` at the given scale (1 =
  72dpi). Returns `{ canvas, widthPt, heightPt }`, where `widthPt`/`heightPt`
  are the page's native PDF-point dimensions (for sizing an export page to
  match).
- **`RASTER_SCALE`** (`= 2`) — the scale `SlideCanvas` renders at for
  on-screen display (~144dpi); reuse it if you want export quality to
  match what's shown on screen.

#### Code-splitting the export path

`buildAnnotatedPdf` and `annotatedFileName` live in a **separate entry
point**, `@pdf-slide-writer/annotation-engine/export`, not the main one.
They pull in jsPDF (and its own heavy transitive deps), which most of a
session's time isn't needed — only at save/export. Import them lazily:

```ts
const { buildAnnotatedPdf, annotatedFileName } = await import(
  '@pdf-slide-writer/annotation-engine/export'
);
```

- **`buildAnnotatedPdf(pdf, historyStore, onProgress?): Promise<Blob>`** —
  re-rasterizes every page fresh (so pages the user never opened still
  export correctly) and composites each page's stored annotations on top
  via an offscreen Fabric `StaticCanvas`, then flattens everything into a
  new PDF with jsPDF. `onProgress?: (page: number, totalPages: number) => void`.
- **`annotatedFileName(originalName: string): string`** — `"My Deck.pdf"` →
  `"My Deck (annotated).pdf"`.

### Types & constants

```ts
type ToolType = 'pen' | 'highlighter' | 'eraser';
type PenColorName = 'black' | 'blue' | 'red';
type PenThicknessName = 'thin' | 'medium' | 'thick';
type HighlighterColorName = 'yellow' | 'green' | 'blue';

const PEN_COLORS: Record<PenColorName, string>;      // hex values
const PEN_THICKNESS: Record<PenThicknessName, number>; // px stroke widths
const HIGHLIGHTER_COLORS: Record<HighlighterColorName, string>;   // translucent rgba() values, used for drawing
const HIGHLIGHTER_SWATCHES: Record<HighlighterColorName, string>; // solid hex values, used for the toolbar swatch buttons
const HIGHLIGHTER_WIDTH: number;
```

### `applyBrushSettings(canvas, settings)`

Configures a Fabric.js canvas's active brush for a given
`{ tool, color, thickness, highlighterColor }`. `SlideCanvas` calls this internally; exported
in case a host app drives its own Fabric canvas directly instead of using
`SlideCanvas`.

## Notes

- **CSS**: `SlideCanvas` renders its Fabric.js overlay via a
  `containerClass` (`.fabric-overlay`) rather than Tailwind utility
  classes, because the browser's `classList.add()` rejects a
  space-separated class string — the one thing Fabric's own container div
  needs from outside. Import `@pdf-slide-writer/annotation-engine/styles.css`
  once to get it.
- **Monorepo/Tailwind**: if your host app uses Tailwind v4 for styling
  (as `apps/web` does), its automatic content scanner won't reach into
  this package's source by default (it doesn't scan node_modules, even
  workspace-symlinked ones). Add an explicit `@source` pointing at this
  package's `src/` in your app's CSS entry — see
  [`apps/web/src/index.css`](../../apps/web/src/index.css) for the exact
  line.
- **No build step**: this package ships TypeScript/TSX source directly
  (`main`/`types`/`exports` all point into `src/`) rather than a compiled
  `dist/`. That's fine for consumption within this npm-workspaces monorepo,
  where Vite transpiles it like any other local module — but it isn't set
  up to be published to the public npm registry as-is. Publishing would
  need a build step (e.g. `tsup`) emitting real `dist/` output.
