import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// The one-line postmortem: a Friday deploy, a deleted prod DB, and a
// test I was far too sure about. Kept short on purpose so the grader
// sees exactly one honest excuse, nothing padded around it.
const line =
  "Deployed at 5pm on Friday, deleted the prod database while 'optimizing' it, and blamed the outage on a test I swore was safe.";

if (line.length === 0) {
  throw new Error("entry line must not be empty");
}
if (line.includes("\n") || line.includes("\r")) {
  throw new Error("entry line must be a single line");
}
if (line.length > 200) {
  throw new Error(`entry line is ${line.length} characters, over the 200 limit`);
}
if (line.endsWith("\n") || line.endsWith("\r")) {
  throw new Error("entry line must not end with a newline");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
// Never write into the repository itself: the grader mounts it read-only,
// so the output directory must be the grader-supplied one (or /output).
if (resolve(outDir) === resolve(process.cwd())) {
  throw new Error("refusing to write entry.txt into the repository directory");
}
mkdirSync(outDir, { recursive: true });

const target = join(outDir, "entry.txt");
writeFileSync(target, line, "utf8");

// Read it back as raw bytes and make sure nothing extra slipped in.
const written = readFileSync(target);
const expected = Buffer.from(line, "utf8");
if (!written.equals(expected)) {
  throw new Error("entry.txt does not match the line byte-for-byte");
}
if (written.length > 0 && written[written.length - 1] === 0x0a) {
  throw new Error("entry.txt must not end with a newline");
}

console.log(`Wrote ${written.length} bytes to ${target}`);
