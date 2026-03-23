export function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function parseChordLine(line) {
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

export function findChordStart(chordChars, desiredStart, chordText) {
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

export function renderAlignedLine(line, showChords) {
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

  const displayLyric = !showChords && hasChordContent ? lyricLine.replace(/^ +/u, "") : lyricLine;
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
