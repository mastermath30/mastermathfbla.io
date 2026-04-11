import type { LocaleCode, TranslationOptions } from "@/lib/translation";

type TextTranslator = (text: string, options?: TranslationOptions) => Promise<string>;
type BatchTranslator = (texts: string[], options?: TranslationOptions) => Promise<Map<string, string>>;

type Translator = {
  tr: TextTranslator;
  trBatch: BatchTranslator;
};

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

function readOriginalText(node: Text): string {
  if (!originalTextByNode.has(node)) {
    originalTextByNode.set(node, node.nodeValue ?? "");
  }
  return originalTextByNode.get(node) ?? "";
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

export async function translateDocumentContent(
  locale: LocaleCode,
  translator: Translator,
  namespace = "page"
): Promise<void> {
  if (typeof document === "undefined") return;
  const root = document.body;
  if (!root) return;

  const textNodes: Text[] = [];
  const textSources = new Set<string>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let node = walker.nextNode();
  while (node) {
    const textNode = node as Text;
    if (isTranslatableTextNode(textNode)) {
      const source = readOriginalText(textNode).trim();
      if (source) {
        textNodes.push(textNode);
        textSources.add(source);
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

  if (locale === "en") {
    textNodes.forEach((textNode) => {
      const source = readOriginalText(textNode);
      if ((textNode.nodeValue ?? "") !== source) {
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

  const translatedMap = await translator.trBatch(Array.from(textSources), { namespace });

  textNodes.forEach((textNode) => {
    const originalRaw = readOriginalText(textNode);
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
