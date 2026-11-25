// The GPS Swears It Was a Shortcut — make.fun entry.
//
// The program below emits exactly one line: the GPS's excuse for the
// wrong road, with no setup and no dialogue tag. The sealed scorer reads
// /output/entry.txt, so this file's only job is to put that line there,
// byte for byte, and to refuse to run if the line ever stops fitting the
// bounty gate (UTF-8, 1-200 characters, single line, no whitespace-only).
//
// Run:  node main.ts [output-path]
//   Without an argument the destination is /output/entry.txt; the
//   ENTRY_OUTPUT environment variable overrides the default too.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The entry text. One sentence, one concrete scene, punch on the last
// words. 109 characters, verified by the guard below at startup.
const ENTRY =
  "The church aisle was a service road on my map, so I delivered you to the front row — right next to the bride.";

function guard(text: string): void {
  const problems: string[] = [];
  if (text.length < 1 || text.length > 200) {
    problems.push(`length ${text.length} is outside 1-200 characters`);
  }
  if (text.trim() === "") {
    problems.push("text is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    problems.push("text spans more than one line");
  }
  for (const ch of text) {
    if (ch.charCodeAt(0) < 0x20 || ch.charCodeAt(0) === 0x7f) {
      problems.push("text contains a control character");
      break;
    }
  }
  if (problems.length > 0) {
    throw new Error(`entry fails the bounty gate: ${problems.join("; ")}`);
  }
}

function destination(): string {
  return (
    process.argv[2] ?? process.env.ENTRY_OUTPUT ?? "/output/entry.txt"
  );
}

const outPath = destination();
guard(ENTRY);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, ENTRY, "utf8");

// Confirm what landed on disk is the same bytes we validated, not a
// truncated or re-encoded copy: compare the raw bytes, not a decoded
// string that could hide an encoding slip.
const onDisk = readFileSync(outPath);
if (!onDisk.equals(Buffer.from(ENTRY, "utf8"))) {
  throw new Error("read-back mismatch: file bytes differ from entry text");
}

console.log(`wrote ${ENTRY.length} characters to ${outPath}`);
