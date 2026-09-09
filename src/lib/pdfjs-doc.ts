import * as pdfjs from "pdfjs-dist/build/pdf.min.mjs";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
}

let queue: Promise<unknown> = Promise.resolve();

/** Serialize getDocument so the viewer and AcroForm extract don't stall the worker. */
export function getPdfDocument(data: Uint8Array) {
  const copy = data.slice();
  const run = queue.then(async () => {
    const task = pdfjs.getDocument({ data: copy, isEvalSupported: false });
    const pdf = await task.promise;
    return { pdf, task };
  });
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export { pdfjs };
