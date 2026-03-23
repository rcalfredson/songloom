import assert from "node:assert/strict";
import { parseChordLine, parseSectionLine, renderLine } from "../parser.mjs";

{
  const tokens = parseChordLine("[A] [E/G#]I wanna [F#m]love ya");
  assert.deepEqual(tokens, [
    { chord: "A", lyric: " " },
    { chord: "E/G#", lyric: "I wanna " },
    { chord: "F#m", lyric: "love ya" },
  ]);
}

{
  const rendered = renderLine("[A] [E/G#]I wanna love ya", { showChords: true, showSections: true });
  assert.match(rendered.html, /A E\/G#/);
  assert.equal(rendered.hasVisibleContent, true);
}

{
  const rendered = renderLine("[A] [E/G#]I wanna love ya", { showChords: false, showSections: true });
  assert.match(rendered.html, />I wanna love ya</);
  assert.doesNotMatch(rendered.html, />\s+I wanna love ya</);
}

{
  const section = parseSectionLine("{Intro}");
  assert.deepEqual(section, { label: "Intro", syntax: "brace" });
}

{
  const legacySection = parseSectionLine("[Verse 1]");
  assert.deepEqual(legacySection, { label: "Verse 1", syntax: "legacy-bracket" });
}

{
  const rendered = renderLine("{Intro}", { showChords: false, showSections: false });
  assert.equal(rendered.html, "");
  assert.equal(rendered.hasVisibleContent, false);
}

{
  const rendered = renderLine("{Verse 1}", { showChords: false, showSections: true });
  assert.match(rendered.html, /section-label/);
  assert.match(rendered.html, />Verse 1</);
  assert.equal(rendered.hasVisibleContent, true);
}

{
  const rendered = renderLine("", { showChords: false, showSections: true });
  assert.equal(rendered.hasVisibleContent, false);
  assert.match(rendered.html, /blank-line/);
}

console.log("parser tests passed");
