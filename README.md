# SongLoom

SongLoom is a minimal, local-first web app for writing printable lyric and chord lead sheets with inline chord syntax.

## Run locally

Because this is a plain static app, you can run it with any simple file server.

### Option 1: Python

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173` in your browser.

### Option 2: Open directly

You can also open `index.html` directly in a browser, though a local server is usually more reliable for file workflows.

## How to use

1. Enter your title, artist, and optional notes.
2. Write lyrics with inline chords like `[G]Hello [C]darkness my old [D]friend`.
3. Adjust size, spacing, columns, and chord visibility.
4. Use `Print / PDF` to open the browser print dialog.
5. Use `Save JSON` and `Load JSON` to keep working copies locally.

## Keyboard shortcuts

- `Cmd+P` / `Ctrl+P`: Print
- `Cmd+S` / `Ctrl+S`: Save JSON
