# PDF Slide Writer

A browser-based PDF annotation tool built for iPad + a Bluetooth/Apple
Pencil-style pen. Pick a PowerPoint-exported PDF from Google Drive, mark it
up with a pen and highlighter, and save the annotated PDF back to Drive.

No native app, no server — it's a static React app that talks to Google
Drive directly from the browser.

## Repo layout

This is an npm-workspaces monorepo:

```
packages/pdf-annotation-engine/   Reusable, storage-agnostic annotation engine
                                   (PDF.js rendering, Fabric.js drawing, undo/
                                   redo, PDF export). No Google Drive knowledge.
                                   See its own README for the full API.
apps/web/                         This Google Drive + iPad app. Composes the
                                   engine with OAuth, the Drive Picker, and
                                   save/download UI.
```

The engine was split out on purpose: it doesn't know where a PDF comes from
or where it goes, so it can be dropped into a different host app (a
different storage backend, a different UI shell) without touching the
rendering/drawing/export logic. See
[`packages/pdf-annotation-engine/README.md`](./packages/pdf-annotation-engine/README.md)
for its API reference and a standalone usage example.

## Stack

- React + TypeScript, built with Vite
- [pdf.js](https://mozilla.github.io/pdf.js/) for rendering slides
- [Fabric.js](http://fabricjs.com/) for the pen/highlighter drawing layer
- [jsPDF](https://github.com/parallax/jsPDF) to flatten annotations back into a PDF
- Google Identity Services (OAuth) + Google Picker + Drive REST API
- Tailwind CSS

## Setup

### 1. Install dependencies

From the repo root (this installs and links both workspaces):

```bash
npm install
```

### 2. Google Cloud project

The app needs an OAuth client and an API key so it can let you pick a file
from Drive and read/write it. All of this is free-tier.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and
   create a project (or use an existing one).
2. **Enable APIs**: APIs & Services → Library → enable both:
   - Google Drive API
   - Google Picker API
3. **OAuth consent screen**: APIs & Services → OAuth consent screen.
   - User type "External" is fine for personal use — add yourself as a
     test user so you don't need Google's app-verification review.
   - Add the scope `https://www.googleapis.com/auth/drive.file` (the app
     never asks for broader Drive access — it only ever touches files you
     explicitly open or create through the Picker).
4. **OAuth client ID**: APIs & Services → Credentials → Create Credentials
   → OAuth client ID → Application type **Web application**.
   - Add your dev URL (e.g. `http://localhost:5173`) and your deployed URL
     under **Authorized JavaScript origins**. No redirect URI is needed —
     this uses the token-client (implicit) flow, not a redirect.
5. **API key**: APIs & Services → Credentials → Create Credentials → API
   key. Restrict it to the Picker API and Drive API for safety.

### 3. Configure environment variables

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in:

```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key
```

### 4. Run it

```bash
npm run dev
```

(Root-level `dev`/`build`/`preview` scripts delegate to the `apps/web`
workspace.) Open the dev URL on your iPad's browser (same network as your
dev machine), or deploy the build output anywhere that serves static files
over HTTPS (Drive's OAuth flow requires a secure origin, and `localhost` is
exempted for local testing).

## How it works

- **Rendering, drawing, undo/redo, export** are all handled by the
  `@pdf-slide-writer/annotation-engine` package — see its
  [README](./packages/pdf-annotation-engine/README.md) for the details
  (rasterization scale, the Fabric-canvas-on-top-of-a-plain-canvas
  architecture, per-page history snapshots, how export re-composites
  everything into a new PDF).
- **Auth**: Google Identity Services issues a short-lived OAuth access
  token scoped to `drive.file` — the app can only see files you pick
  through the Google Picker, never your whole Drive.
- **Save**: "Save" overwrites the original Drive file's content; "Save a
  copy" creates a new file named `<original> (annotated).pdf`; the
  download button saves straight to the iPad instead, as a fallback if
  Drive is unreachable.

## Notes / known limits

- `pdfjs-dist` is pinned to `5.4.624` (not the latest `6.x`) because newer
  releases call `Map.prototype.getOrInsertComputed`, a very recent JS
  engine feature that current Safari/iPadOS doesn't support yet — using it
  would silently break rendering on the actual target device. Re-check
  Safari's support before bumping past this pin.
- Pressure sensitivity: the brush width is set per-stroke, not varied
  continuously within a stroke — full pressure-sensitive variable-width
  ink would need a custom Fabric brush. Worth revisiting if the Temu pen's
  pressure curve feels flat in practice.
- Zoom relies on the OS/browser's native pinch-to-zoom rather than an
  in-app zoom control (see `allowTouchScrolling` in `SlideCanvas.tsx`) —
  single-finger touch pans/scrolls while a pen draws, and two-finger pinch
  zooms the page. Worth a real device pass to confirm this feels right,
  since it couldn't be verified outside an actual iPad + Bluetooth pen.
- No automated test suite yet — verification so far is `tsc`, `vite
  build`, and manual/Playwright smoke testing in a desktop browser
  (mouse-simulated strokes, undo/redo, page nav, highlighter, and a full
  export round-trip all confirmed working, both before and after the
  workspace split). The Google OAuth/Drive/Picker flow itself hasn't been
  exercised against real Google infra — that needs a real Cloud project +
  credentials to test.
- The `@pdf-slide-writer/annotation-engine` package ships source directly
  (no build step) — fine for consumption within this monorepo, but it
  would need a bundler build step to publish externally. See its README's
  Notes section.
