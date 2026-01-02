import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const src = path.join(
  projectRoot,
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs"
);
const outDir = path.join(projectRoot, "public", "pdfjs");
const dest = path.join(outDir, "pdf.worker.min.mjs");

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  await fs.copyFile(src, dest);
  // eslint-disable-next-line no-console
  console.log(`[pdfjs] Copied worker -> ${path.relative(projectRoot, dest)}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[pdfjs] Failed to copy worker:", err);
  process.exitCode = 1;
});


