// @ts-ignore
import * as pdf from "pdf-parse";
import mammoth from "mammoth";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import { extractImageText } from "@/lib/gemini/client";
import type { ExtractedMaterialSegment } from "./types";

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);
const PPTX_TYPE = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function normalizeExtractedText(text: string) {
  return text.replace(/\r/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function collectTextNodes(value: unknown, output: string[] = []): string[] {
  if (typeof value === "string" || typeof value === "number") {
    output.push(String(value));
    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectTextNodes(item, output));
    return output;
  }

  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (key === "a:t" || key.endsWith(":t")) {
        collectTextNodes(item, output);
      } else if (typeof item === "object") {
        collectTextNodes(item, output);
      }
    }
  }

  return output;
}

async function extractPdf(buffer: Buffer): Promise<ExtractedMaterialSegment[]> {
  const segments: ExtractedMaterialSegment[] = [];

  try {
    const parser = new pdf.PDFParse({ data: buffer });
    const result = await parser.getText();
    // result.pages contains array of PageTextResult
    result.pages.forEach((page, index) => {
      segments.push({
        page: page.num || (index + 1),
        text: normalizeExtractedText(page.text),
      });
    });
  } catch (error) {
    console.error("[extract:pdf] pdf-parse failed:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to parse PDF document");
  }

  // Ensure pages are sorted in order
  segments.sort((a, b) => (a.page || 0) - (b.page || 0));
  return segments.filter((segment) => segment.text.length > 0);
}

async function extractDocx(buffer: Buffer): Promise<ExtractedMaterialSegment[]> {
  const result = await mammoth.extractRawText({ buffer });
  const text = normalizeExtractedText(result.value ?? "");
  return text ? [{ text }] : [];
}

async function extractPptx(buffer: Buffer): Promise<ExtractedMaterialSegment[]> {
  const zip = await JSZip.loadAsync(buffer);
  const parser = new XMLParser({ ignoreAttributes: false });
  const slideFiles = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path))
    .sort((left, right) => {
      const leftNumber = Number(left.match(/slide(\d+)\.xml/)?.[1] ?? 0);
      const rightNumber = Number(right.match(/slide(\d+)\.xml/)?.[1] ?? 0);
      return leftNumber - rightNumber;
    });

  const segments: ExtractedMaterialSegment[] = [];

  for (const slidePath of slideFiles) {
    const xml = await zip.file(slidePath)?.async("text");
    if (!xml) {
      continue;
    }

    const parsed = parser.parse(xml);
    const slideNumber = Number(slidePath.match(/slide(\d+)\.xml/)?.[1] ?? segments.length + 1);
    const text = normalizeExtractedText(collectTextNodes(parsed).join("\n"));

    if (text) {
      segments.push({ slide: slideNumber, text });
    }
  }

  return segments;
}

async function extractImage(buffer: Buffer, mimeType: string, fileName: string): Promise<ExtractedMaterialSegment[]> {
  const text = normalizeExtractedText(await extractImageText(buffer, mimeType, fileName));
  return text ? [{ text, section: "Image extraction" }] : [];
}

export async function extractMaterialText(params: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}): Promise<ExtractedMaterialSegment[]> {
  if (params.mimeType === "application/pdf") {
    return extractPdf(params.buffer);
  }

  if (params.mimeType === DOCX_TYPE) {
    return extractDocx(params.buffer);
  }

  if (params.mimeType === PPTX_TYPE) {
    return extractPptx(params.buffer);
  }

  if (params.mimeType === "text/plain") {
    const text = normalizeExtractedText(params.buffer.toString("utf8"));
    return text ? [{ text }] : [];
  }

  if (IMAGE_TYPES.has(params.mimeType)) {
    return extractImage(params.buffer, params.mimeType, params.fileName);
  }

  throw new Error(`Unsupported file type: ${params.mimeType || "unknown"}`);
}
