/**
 * Extract plain text from an uploaded document. Parsers are imported
 * dynamically so their bundles never land in the main client chunk —
 * only the format the user actually dropped gets loaded.
 *
 * Supported:
 *   - text/plain          → direct read
 *   - .docx (Word)        → mammoth
 *   - .pdf                → pdfjs-dist
 *   - .pptx (PowerPoint)  → jszip (walk the slide XML)
 */

export type ExtractableKind = "txt" | "docx" | "pdf" | "pptx";

function detectKind(file: File): ExtractableKind | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt") || file.type === "text/plain") return "txt";
  if (name.endsWith(".docx")) return "docx";
  if (name.endsWith(".pdf") || file.type === "application/pdf") return "pdf";
  if (name.endsWith(".pptx")) return "pptx";
  return null;
}

async function extractTxt(file: File): Promise<string> {
  return await file.text();
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const buf = await file.arrayBuffer();
  const res = await mammoth.extractRawText({ arrayBuffer: buf });
  return res.value ?? "";
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  // pdf.js needs a worker URL; point at the bundled worker entry. Using
  // `new URL(..., import.meta.url)` lets Turbopack/webpack emit the worker
  // as its own asset instead of trying to inline it.
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    parts.push(line);
  }
  return parts.join("\n\n").trim();
}

async function extractPptx(file: File): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const buf = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);
  const slideNames = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const ai = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] ?? "0", 10);
      const bi = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] ?? "0", 10);
      return ai - bi;
    });

  const slides: string[] = [];
  for (const name of slideNames) {
    const xml = await zip.files[name].async("string");
    // PPTX wraps text runs in <a:t>...</a:t>. A blunt regex extract is
    // good enough for a rough script seed.
    const text = Array.from(xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g))
      .map((m) =>
        m[1]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'"),
      )
      .join(" ")
      .trim();
    if (text) slides.push(text);
  }
  return slides.join("\n\n");
}

export async function extractTextFromFile(file: File): Promise<string> {
  const kind = detectKind(file);
  if (!kind) {
    throw new Error(
      `Unsupported file type: ${file.type || file.name}. Use TXT, DOCX, PDF, or PPTX.`,
    );
  }
  switch (kind) {
    case "txt":
      return extractTxt(file);
    case "docx":
      return extractDocx(file);
    case "pdf":
      return extractPdf(file);
    case "pptx":
      return extractPptx(file);
  }
}
