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
3. Add section labels on their own line with braces, like `{Verse 1}` or `{Chorus}`.
4. Adjust size, spacing, columns, chord visibility, and section visibility.
5. Use `Print / PDF` to open the browser print dialog.
6. Use `Save JSON` and `Load JSON` to keep working copies locally.

## Notes

- Use `[]` for chords and `{}` for section labels.
- Older charts with a whole-line bracket label like `[Verse 1]` still work as legacy section labels, but the preferred syntax is `{Verse 1}`.
- The lead-sheet body uses a monospaced layout so chord alignment stays reliable in preview and print.

## Keyboard shortcuts

- `Cmd+P` / `Ctrl+P`: Print
- `Cmd+S` / `Ctrl+S`: Save JSON

## Development Check

```bash
node tests/parser.test.mjs
```
