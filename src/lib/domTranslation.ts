import type { LocaleCode, TranslationOptions } from "@/lib/translation";

type TextTranslator = (text: string, options?: TranslationOptions) => Promise<string>;
type BatchTranslator = (texts: string[], options?: TranslationOptions) => Promise<Map<string, string>>;

type Translator = {
  tr: TextTranslator;
  trBatch: BatchTranslator;
};

// Keyed by DOM text node reference. Only stores the ENGLISH original.
// We only write to this map during an EN sweep (locale === "en"), ensuring
// we always have the true source text to translate from.
const originalTextByNode = new WeakMap<Text, string>();
const originalAttrsByElement = new WeakMap<Element, Record<string, string>>();
const translatableAttributes = ["placeholder", "title", "aria-label", "alt", "value"];

function isTranslatableTextNode(node: Text): boolean {
  const value = (node.nodeValue ?? "").trim();
  if (!value) return false;
  if (!/[A-Za-z]/.test(value)) return false;

  const parent = node.parentElement;
  if (!parent) return false;
  const tag = parent.tagName.toLowerCase();
  if (["script", "style", "noscript", "code", "pre", "kbd"].includes(tag)) return false;
  if (parent.closest("[data-no-auto-translate='true']")) return false;
  if (parent.closest("[contenteditable='true']")) return false;
  return true;
}

/**
 * Returns the stored English original for this text node.
 *
 * @param isEnSweep - true only during an EN sweep. When true, unknown nodes
 *   get their current nodeValue stored as the English original (safe because
 *   the DOM is in EN at that point). When false (non-EN sweep), nodes not yet
 *   in the WeakMap are skipped — this prevents storing non-EN text as
 *   "original" for nodes that React just created via t().
 */
function readOriginalText(node: Text, isEnSweep: boolean): string | null {
  if (!originalTextByNode.has(node)) {
    if (isEnSweep) {
      originalTextByNode.set(node, node.nodeValue ?? "");
    } else {
      // Node was created while a non-EN language was active (e.g., page navigation).
      // We don't know the English original, so skip rather than store wrong text.
      return null;
    }
  }
  return originalTextByNode.get(node) ?? null;
}

function readOriginalAttr(element: Element, attr: string): string | null {
  const existing = originalAttrsByElement.get(element) ?? {};
  if (!(attr in existing)) {
    const current = element.getAttribute(attr);
    if (current !== null) {
      existing[attr] = current;
      originalAttrsByElement.set(element, existing);
    }
  }
  return originalAttrsByElement.get(element)?.[attr] ?? null;
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

/**
 * Translates all text and attribute content in the document body.
 *
 * @param signal - AbortSignal from an AbortController scoped to the current
 *   language. When language changes, the caller aborts the controller so that
 *   stale API responses are never applied to the DOM. Always check this BEFORE
 *   and AFTER any async work.
 */
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

  const textNodes: Text[] = [];
  const textSources = new Set<string>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let node = walker.nextNode();
  while (node) {
    const textNode = node as Text;
    if (isTranslatableTextNode(textNode)) {
      const original = readOriginalText(textNode, isEnSweep);
      if (original !== null) {
        const source = original.trim();
        if (source) {
          textNodes.push(textNode);
          textSources.add(source);
        }
      }
    }
    node = walker.nextNode();
  }

  const attrTargets: Array<{ element: Element; attr: string; source: string }> = [];
  const elements = Array.from(root.querySelectorAll("*"));
  for (const element of elements) {
    if (element.closest("[data-no-auto-translate='true']")) continue;
    for (const attr of translatableAttributes) {
      if (attr === "value" && !canTranslateValueAttribute(element)) continue;
      const source = readOriginalAttr(element, attr);
      if (!source) continue;
      if (!/[A-Za-z]/.test(source)) continue;
      attrTargets.push({ element, attr, source });
      textSources.add(source);
    }
  }

  if (signal?.aborted) return;

  if (isEnSweep) {
    // Restore all nodes to their English originals (stored in WeakMap).
    textNodes.forEach((textNode) => {
      const source = readOriginalText(textNode, true);
      if (source !== null && (textNode.nodeValue ?? "") !== source) {
        textNode.nodeValue = source;
      }
    });
    attrTargets.forEach(({ element, attr, source }) => {
      if (element.getAttribute(attr) !== source) {
        element.setAttribute(attr, source);
      }
    });
    return;
  }

  // Non-EN: fetch translations from the API / cache.
  const translatedMap = await translator.trBatch(Array.from(textSources), { namespace });

  // CRITICAL: check abort AFTER the async call. If language changed while the
  // API was in flight, this prevents stale translations from being painted.
  if (signal?.aborted) return;

  textNodes.forEach((textNode) => {
    const original = readOriginalText(textNode, false);
    if (original === null) return;
    const originalRaw = original;
    const source = originalRaw.trim();
    const translatedCore = translatedMap.get(source) ?? source;
    const translated = preserveWhitespace(originalRaw, translatedCore);
    if ((textNode.nodeValue ?? "") !== translated) {
      textNode.nodeValue = translated;
    }
  });

  attrTargets.forEach(({ element, attr, source }) => {
    const translated = translatedMap.get(source) ?? source;
    if (element.getAttribute(attr) !== translated) {
      element.setAttribute(attr, translated);
    }
  });
}
