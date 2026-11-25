// The GPS Swears It Was a Shortcut — entry program.
//
// Writes the GPS's one-line excuse to /output/entry.txt, exactly as drafted:
// a single line of plain text, no setup, no dialogue tag, just the excuse.
//
// Usage: node main.ts [output-path]
//   Defaults to /output/entry.txt (ENTRY_OUTPUT env var also works).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const EXCUSE =
  "The shortcut existed on my map from 2019, when that cornfield was still a highway and the lake was still a parking lot.";

const OUTPUT_PATH =
  process.argv[2] ?? process.env.ENTRY_OUTPUT ?? "/output/entry.txt";

// Gate guard: the sealed scorer only accepts UTF-8 text of 1-200
// characters that is not only whitespace, on a single line. Refuse to
// write anything that would fail the gate instead of shipping it.
function validate(text: string): void {
  if (text.length < 1 || text.length > 200) {
    throw new Error(`entry is ${text.length} characters, must be 1-200`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (/[\r\n]/.test(text)) {
    throw new Error("entry must be a single line");
  }
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) {
    throw new Error("entry must not contain control characters");
  }
}

validate(EXCUSE);

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, EXCUSE, "utf8");

// Read-back check: the file the grader scores must be byte-for-byte the
// validated excuse. A partial write or encoding surprise fails loudly here
// instead of silently shipping a broken entry.
const written = readFileSync(OUTPUT_PATH, "utf8");
if (written !== EXCUSE) {
  throw new Error(
    `read-back mismatch: file holds ${written.length} characters, expected ${EXCUSE.length}`,
  );
}
console.log(`wrote ${EXCUSE.length} characters to ${OUTPUT_PATH}`);
