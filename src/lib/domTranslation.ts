import type { LocaleCode, TranslationOptions } from "@/lib/translation";

type TextTranslator = (text: string, options?: TranslationOptions) => Promise<string>;
type BatchTranslator = (texts: string[], options?: TranslationOptions) => Promise<Map<string, string>>;

type Translator = {
  tr: TextTranslator;
  trBatch: BatchTranslator;
};

type TranslationTarget =
  | { kind: "stored"; raw: string; trimmed: string }
  | { kind: "live"; raw: string; trimmed: string };

// Store English originals only when we are certain the DOM is in English.
// Nodes first seen in another language fall back to translating their current
// visible text with source auto-detection instead of staying stuck.
const originalTextByNode = new WeakMap<Text, string>();
const originalAttrsByElement = new WeakMap<Element, Record<string, string>>();
const translatableAttributes = ["placeholder", "title", "aria-label", "alt", "value"];
const letterPattern = /\p{L}/u;

function containsLetters(value: string): boolean {
  return letterPattern.test(value);
}

function isTranslatableTextNode(node: Text): boolean {
  const value = (node.nodeValue ?? "").trim();
  if (!value) return false;
  if (!containsLetters(value)) return false;

  const parent = node.parentElement;
  if (!parent) return false;
  const tag = parent.tagName.toLowerCase();
  if (["script", "style", "noscript", "code", "pre", "kbd"].includes(tag)) return false;
  if (parent.closest("[data-no-auto-translate='true']")) return false;
  if (parent.closest("[contenteditable='true']")) return false;
  return true;
}

function readOriginalText(node: Text, isEnSweep: boolean): string | null {
  if (!originalTextByNode.has(node)) {
    if (isEnSweep) {
      originalTextByNode.set(node, node.nodeValue ?? "");
    } else {
      return null;
    }
  }
  return originalTextByNode.get(node) ?? null;
}

function readOriginalAttr(element: Element, attr: string, isEnSweep: boolean): string | null {
  const existing = originalAttrsByElement.get(element) ?? {};
  if (!(attr in existing)) {
    const current = element.getAttribute(attr);
    if (current !== null && isEnSweep) {
      existing[attr] = current;
      originalAttrsByElement.set(element, existing);
    }
  }
  return originalAttrsByElement.get(element)?.[attr] ?? null;
}

function resolveTextTarget(node: Text, isEnSweep: boolean): TranslationTarget | null {
  const stored = readOriginalText(node, isEnSweep);
  if (stored !== null) {
    const trimmed = stored.trim();
    return trimmed ? { kind: "stored", raw: stored, trimmed } : null;
  }

  const live = node.nodeValue ?? "";
  const trimmed = live.trim();
  return trimmed ? { kind: "live", raw: live, trimmed } : null;
}

function resolveAttrTarget(element: Element, attr: string, isEnSweep: boolean): TranslationTarget | null {
  const stored = readOriginalAttr(element, attr, isEnSweep);
  if (stored !== null) {
    const trimmed = stored.trim();
    return trimmed ? { kind: "stored", raw: stored, trimmed } : null;
  }

  const live = element.getAttribute(attr) ?? "";
  const trimmed = live.trim();
  return trimmed ? { kind: "live", raw: live, trimmed } : null;
}

function canTranslateValueAttribute(element: Element): boolean {
  if (element.tagName.toLowerCase() !== "input") return false;
  const input = element as HTMLInputElement;
  return ["submit", "button", "reset"].includes(input.type);
}

function preserveWhitespace(originalRaw: string, translatedCore: string): string {
  const leading = originalRaw.match(/^\s*/)?.[0] ?? "";
  const trailing = originalRaw.match(/\s*$/)?.[0] ?? "";
  return `${leading}${translatedCore}${trailing}`;
}

export async function translateDocumentContent(
  locale: LocaleCode,
  translator: Translator,
  namespace = "page",
  signal?: AbortSignal
): Promise<void> {
  if (typeof document === "undefined") return;
  if (signal?.aborted) return;

  const root = document.body;
  if (!root) return;

  const isEnSweep = locale === "en";
  const textTargets: Array<{ node: Text; target: TranslationTarget }> = [];
  const attrTargets: Array<{ element: Element; attr: string; target: TranslationTarget }> = [];
  const storedSources = new Set<string>();
  const liveSources = new Set<string>();

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const textNode = node as Text;
    if (isTranslatableTextNode(textNode)) {
      const target = resolveTextTarget(textNode, isEnSweep);
      if (target) {
        textTargets.push({ node: textNode, target });
        if (target.kind === "stored") {
          storedSources.add(target.trimmed);
        } else {
          liveSources.add(target.trimmed);
        }
      }
    }
    node = walker.nextNode();
  }

  const elements = Array.from(root.querySelectorAll("*"));
  for (const element of elements) {
    if (element.closest("[data-no-auto-translate='true']")) continue;
    for (const attr of translatableAttributes) {
      if (attr === "value" && !canTranslateValueAttribute(element)) continue;
      const target = resolveAttrTarget(element, attr, isEnSweep);
      if (!target) continue;
      if (!containsLetters(target.trimmed)) continue;
      attrTargets.push({ element, attr, target });
      if (target.kind === "stored") {
        storedSources.add(target.trimmed);
      } else {
        liveSources.add(target.trimmed);
      }
    }
  }

  if (signal?.aborted) return;

  const storedTranslatedMap =
    !isEnSweep && storedSources.size > 0
      ? await translator.trBatch(Array.from(storedSources), {
          namespace,
          signal,
          sourceLocale: "en",
        })
      : new Map<string, string>();

  if (signal?.aborted) return;

  const liveTranslatedMap =
    liveSources.size > 0
      ? await translator.trBatch(Array.from(liveSources), {
          namespace,
          signal,
          sourceLocale: "auto",
        })
      : new Map<string, string>();

  if (signal?.aborted) return;

  textTargets.forEach(({ node: textNode, target }) => {
    const translatedCore =
      target.kind === "stored"
        ? isEnSweep
          ? target.trimmed
          : storedTranslatedMap.get(target.trimmed) ?? target.trimmed
        : liveTranslatedMap.get(target.trimmed) ?? target.trimmed;

    const translated = preserveWhitespace(target.raw, translatedCore);
    if ((textNode.nodeValue ?? "") !== translated) {
      textNode.nodeValue = translated;
    }

    if (isEnSweep && target.kind === "live") {
      originalTextByNode.set(textNode, translated);
    }
  });

  attrTargets.forEach(({ element, attr, target }) => {
    const translated =
      target.kind === "stored"
        ? isEnSweep
          ? target.trimmed
          : storedTranslatedMap.get(target.trimmed) ?? target.trimmed
        : liveTranslatedMap.get(target.trimmed) ?? target.trimmed;

    if (element.getAttribute(attr) !== translated) {
      element.setAttribute(attr, translated);
    }

    if (isEnSweep && target.kind === "live") {
      const existing = originalAttrsByElement.get(element) ?? {};
      existing[attr] = translated;
      originalAttrsByElement.set(element, existing);
    }
  });
}
