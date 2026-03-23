import assert from "node:assert/strict";
import { parseChordLine, renderAlignedLine } from "../parser.mjs";

{
  const tokens = parseChordLine("[A] [E/G#]I wanna [F#m]love ya");
  assert.deepEqual(tokens, [
    { chord: "A", lyric: " " },
    { chord: "E/G#", lyric: "I wanna " },
    { chord: "F#m", lyric: "love ya" },
  ]);
}

{
  const rendered = renderAlignedLine("[A] [E/G#]I wanna love ya", true);
  assert.match(rendered.html, /A E\/G#/);
  assert.equal(rendered.hasVisibleLyric, true);
}

{
  const rendered = renderAlignedLine("[A] [E/G#]I wanna love ya", false);
  assert.match(rendered.html, />I wanna love ya</);
  assert.doesNotMatch(rendered.html, />\s+I wanna love ya</);
}

{
  const rendered = renderAlignedLine("[Intro]", false);
  assert.equal(rendered.html, "");
  assert.equal(rendered.hasVisibleLyric, false);
}

{
  const rendered = renderAlignedLine("", false);
  assert.equal(rendered.hasVisibleLyric, false);
  assert.match(rendered.html, /blank-line/);
}

console.log("parser tests passed");
