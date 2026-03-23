const DEFAULT_SONG = {
  title: "Is This Love",
  artist: "Bob Marley",
  notes: "Adjust spacing or columns for print.",
  lyrics: `[Intro]
[F#m] [D] [A] [x2]

[Verse 1]
[A] [E/G#]I wanna [F#m]love ya, [D]and treat you [A]right.
[E/G#]I wanna [F#m]love ya, every [D]day and every [A]night.
We'll [E/G#]be to-[F#m]gether, with a [D] roof right over our [A]heads,
We'll [E/G#]share the [F#m]shelter, [D]of my single [A]bed.
We'll [E/G#]share the [F#m]same room; [D]Jah provide the [A]bread.`,
  fontSize: 16,
  lineSpacing: 1.35,
  columns: 1,
  showChords: true,
};

const state = { ...DEFAULT_SONG };

const elements = {
  titleInput: document.querySelector("#titleInput"),
  artistInput: document.querySelector("#artistInput"),
  notesInput: document.querySelector("#notesInput"),
  lyricsInput: document.querySelector("#lyricsInput"),
  fontSizeInput: document.querySelector("#fontSizeInput"),
  fontSizeOutput: document.querySelector("#fontSizeOutput"),
  lineSpacingInput: document.querySelector("#lineSpacingInput"),
  lineSpacingOutput: document.querySelector("#lineSpacingOutput"),
  columnSelect: document.querySelector("#columnSelect"),
  showChordsInput: document.querySelector("#showChordsInput"),
  printButton: document.querySelector("#printButton"),
  saveButton: document.querySelector("#saveButton"),
  loadInput: document.querySelector("#loadInput"),
  previewTitle: document.querySelector("#previewTitle"),
  previewArtist: document.querySelector("#previewArtist"),
  previewNotes: document.querySelector("#previewNotes"),
  sheetPreview: document.querySelector("#sheetPreview"),
  previewBody: document.querySelector("#previewBody"),
};

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseChordLine(line) {
  const tokens = [];
  const chordPattern = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let pendingChord = null;

  for (const match of line.matchAll(chordPattern)) {
    const lyric = line.slice(lastIndex, match.index);

    if (lyric || pendingChord !== null) {
      tokens.push({ chord: pendingChord, lyric });
    }

    pendingChord = match[1].trim();
    lastIndex = match.index + match[0].length;
  }

  const trailingLyric = line.slice(lastIndex);
  tokens.push({ chord: pendingChord, lyric: trailingLyric });

  return tokens;
}

function findChordStart(chordChars, desiredStart, chordText) {
  let start = desiredStart;
  let shouldShift = true;

  while (shouldShift) {
    shouldShift = false;

    for (let index = 0; index < chordText.length; index += 1) {
      if (chordChars[start + index] && chordChars[start + index] !== " ") {
        shouldShift = true;
        start += 1;
        break;
      }
    }

    if (!shouldShift && start > 0 && chordChars[start - 1] && chordChars[start - 1] !== " ") {
      shouldShift = true;
      start += 1;
    }
  }

  return start;
}

function renderAlignedLine(line, showChords) {
  const tokens = parseChordLine(line);
  const chordChars = [];
  let lyricLine = "";
  let hasAnchoredLyric = false;

  for (const token of tokens) {
    const lyricStart = lyricLine.length;

    if (token.chord) {
      const chordStart = findChordStart(chordChars, lyricStart, token.chord);

      // If a chord appears before the first lyric anchor, pad the lyric line
      // so the first sung word can still start under its intended chord.
      if (!hasAnchoredLyric && lyricLine.length < chordStart) {
        lyricLine = lyricLine.padEnd(chordStart, " ");
      }

      for (let index = 0; index < token.chord.length; index += 1) {
        chordChars[chordStart + index] = token.chord[index];
      }
    }

    lyricLine += token.lyric;

    if (!hasAnchoredLyric && token.lyric.trim().length > 0) {
      hasAnchoredLyric = true;
    }
  }

  const chordLength = Math.max(chordChars.length, lyricLine.length);
  const chordLine = Array.from({ length: chordLength }, (_, index) => chordChars[index] || " ").join("");
  const hasVisibleLyric = lyricLine.trim().length > 0;
  const hasChordContent = chordLine.trim().length > 0;

  if (!showChords && !hasVisibleLyric && hasChordContent) {
    return { html: "", hasVisibleLyric: false };
  }

  const displayLyric = !showChords && chordLine.trim().length > 0 ? lyricLine.replace(/^ +/u, "") : lyricLine;
  const safeLyric = displayLyric.length > 0 ? displayLyric : " ";
  const safeChord = chordLine.length > 0 ? chordLine : " ";
  const blankClass = displayLyric.trim().length === 0 && !hasChordContent ? " blank-line" : "";
  const chordClass = showChords ? "chord-row" : "chord-row is-hidden";

  return {
    html: `
      <div class="render-line${blankClass}">
        <pre class="${chordClass}">${escapeHtml(safeChord)}</pre>
        <pre class="lyric-row">${escapeHtml(safeLyric)}</pre>
      </div>
    `,
    hasVisibleLyric: displayLyric.trim().length > 0,
  };
}

function renderPreview() {
  elements.previewTitle.textContent = state.title.trim() || "Untitled Song";
  elements.previewArtist.textContent = state.artist.trim();
  elements.previewNotes.textContent = state.notes.trim();

  elements.sheetPreview.style.setProperty("--sheet-font-size", `${state.fontSize}px`);
  elements.sheetPreview.style.setProperty("--sheet-line-height", String(state.lineSpacing));

  const renderedLines = state.lyrics.split("\n").map((line) => renderAlignedLine(line, state.showChords));
  const normalizedLines = [...renderedLines];

  if (!state.showChords) {
    while (normalizedLines.length > 0 && !normalizedLines[0].hasVisibleLyric) {
      normalizedLines.shift();
    }
  }

  elements.previewBody.className = `song-body columns-${state.columns}`;
  elements.previewBody.innerHTML = normalizedLines.map((line) => line.html).join("");
}

function syncControls() {
  elements.titleInput.value = state.title;
  elements.artistInput.value = state.artist;
  elements.notesInput.value = state.notes;
  elements.lyricsInput.value = state.lyrics;
  syncFormattingControls();
}

function syncFormattingControls() {
  elements.fontSizeInput.value = String(state.fontSize);
  elements.lineSpacingInput.value = String(state.lineSpacing);
  elements.columnSelect.value = String(state.columns);
  elements.showChordsInput.checked = state.showChords;
  elements.fontSizeOutput.value = `${state.fontSize}px`;
  elements.lineSpacingOutput.value = Number(state.lineSpacing).toFixed(2);
}

function updateState(patch) {
  Object.assign(state, patch);
  syncFormattingControls();
  renderPreview();
}

function downloadJson() {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const slug = (state.title.trim() || "songloom-sheet")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  link.href = url;
  link.download = `${slug || "songloom-sheet"}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function loadSongFile(file) {
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      updateState({
        title: String(parsed.title || ""),
        artist: String(parsed.artist || ""),
        notes: String(parsed.notes || ""),
        lyrics: String(parsed.lyrics || ""),
        fontSize: Number.isFinite(parsed.fontSize) ? Math.min(24, Math.max(12, Number(parsed.fontSize))) : 16,
        lineSpacing: Number.isFinite(parsed.lineSpacing)
          ? Math.min(2, Math.max(1, Number(parsed.lineSpacing)))
          : 1.35,
        columns: parsed.columns === 2 ? 2 : 1,
        showChords: parsed.showChords !== false,
      });
    } catch (error) {
      window.alert("Could not load that file. Please choose a SongLoom JSON export.");
    }
  });

  reader.readAsText(file);
}

function attachEvents() {
  elements.titleInput.addEventListener("input", (event) => updateState({ title: event.target.value }));
  elements.artistInput.addEventListener("input", (event) => updateState({ artist: event.target.value }));
  elements.notesInput.addEventListener("input", (event) => updateState({ notes: event.target.value }));
  elements.lyricsInput.addEventListener("input", (event) => updateState({ lyrics: event.target.value }));
  elements.fontSizeInput.addEventListener("input", (event) => updateState({ fontSize: Number(event.target.value) }));
  elements.lineSpacingInput.addEventListener("input", (event) =>
    updateState({ lineSpacing: Number(event.target.value) }),
  );
  elements.columnSelect.addEventListener("change", (event) => updateState({ columns: Number(event.target.value) }));
  elements.showChordsInput.addEventListener("change", (event) => updateState({ showChords: event.target.checked }));
  elements.printButton.addEventListener("click", () => window.print());
  elements.saveButton.addEventListener("click", downloadJson);
  elements.loadInput.addEventListener("change", (event) => {
    const [file] = event.target.files || [];
    if (file) {
      loadSongFile(file);
      event.target.value = "";
    }
  });

  document.addEventListener("keydown", (event) => {
    const modifierPressed = event.metaKey || event.ctrlKey;

    if (!modifierPressed) {
      return;
    }

    if (event.key.toLowerCase() === "p") {
      event.preventDefault();
      window.print();
    }

    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      downloadJson();
    }
  });
}

syncControls();
renderPreview();
attachEvents();
