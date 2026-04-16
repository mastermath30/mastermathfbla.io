import type { LanguageCode } from "@/lib/i18n";

export type TranslationKey = string;
export type LocaleCode = LanguageCode;
export type TranslationSource = "dictionary" | "cache" | "api" | "fallback";

export type TranslationResult = {
  text: string;
  source: TranslationSource;
};

export type Localized<T> = Record<LanguageCode, T>;

export type TranslationOptions = {
  namespace?: string;
  htmlSafe?: boolean;
  /** AbortSignal from the current language's AbortController. */
  signal?: AbortSignal;
};

export type TranslationStatus = {
  missingKeys: string[];
  apiFallbackCount: number;
  cacheHitCount: number;
  apiHitCount: number;
};

const CACHE_STORAGE_KEY = "mm_i18n_cache_v1";
const IN_MEMORY_CACHE = new Map<string, string>();
const IN_FLIGHT = new Map<string, Promise<string>>();
const STATUS: TranslationStatus = {
  missingKeys: [],
  apiFallbackCount: 0,
  cacheHitCount: 0,
  apiHitCount: 0,
};

function safeReadCache(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function safeWriteCache(nextCache: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(nextCache));
  } catch {
    // Ignore quota or serialization errors.
  }
}

function makeCacheKey(locale: LocaleCode, sourceText: string, namespace = "default"): string {
  return `${locale}::${namespace}::${sourceText}`;
}

function getCachedTranslation(locale: LocaleCode, sourceText: string, namespace?: string): string | null {
  const key = makeCacheKey(locale, sourceText, namespace);
  if (IN_MEMORY_CACHE.has(key)) {
    STATUS.cacheHitCount += 1;
    return IN_MEMORY_CACHE.get(key) ?? null;
  }

  const persisted = safeReadCache();
  const persistedValue = persisted[key];
  if (persistedValue) {
    IN_MEMORY_CACHE.set(key, persistedValue);
    STATUS.cacheHitCount += 1;
    return persistedValue;
  }
  return null;
}

function setCachedTranslation(locale: LocaleCode, sourceText: string, translatedText: string, namespace?: string) {
  const key = makeCacheKey(locale, sourceText, namespace);
  IN_MEMORY_CACHE.set(key, translatedText);
  const persisted = safeReadCache();
  persisted[key] = translatedText;
  safeWriteCache(persisted);
}

function addMissingKey(key: string) {
  if (!STATUS.missingKeys.includes(key)) {
    STATUS.missingKeys.push(key);
  }
}

export function getTranslationStatus(): TranslationStatus {
  return {
    ...STATUS,
    missingKeys: [...STATUS.missingKeys],
  };
}

export function registerMissingTranslationKey(key: string) {
  addMissingKey(key);
}

export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, token: string) => {
    const value = params[token];
    return value === undefined ? `{${token}}` : String(value);
  });
}

async function fetchTranslationFromApi(
  locale: LocaleCode,
  sourceText: string,
  namespace?: string,
  signal?: AbortSignal
): Promise<string> {
  const payload = {
    target: locale,
    texts: [sourceText],
    namespace: namespace ?? "default",
  };

  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Translation request failed: ${response.status}`);
  }

  const json = (await response.json()) as { translations?: string[] };
  const translated = json.translations?.[0];
  if (!translated || typeof translated !== "string") {
    throw new Error("No translation received");
  }
  STATUS.apiHitCount += 1;
  setCachedTranslation(locale, sourceText, translated, namespace);
  return translated;
}

export async function trText(
  locale: LocaleCode,
  sourceText: string,
  options?: TranslationOptions
): Promise<TranslationResult> {
  if (!sourceText || locale === "en") {
    return { text: sourceText, source: "fallback" };
  }

  const cached = getCachedTranslation(locale, sourceText, options?.namespace);
  if (cached) {
    return { text: cached, source: "cache" };
  }

  const inflightKey = makeCacheKey(locale, sourceText, options?.namespace);
  if (!IN_FLIGHT.has(inflightKey)) {
    IN_FLIGHT.set(
      inflightKey,
      fetchTranslationFromApi(locale, sourceText, options?.namespace)
        .catch(() => {
          STATUS.apiFallbackCount += 1;
          return sourceText;
        })
        .finally(() => {
          IN_FLIGHT.delete(inflightKey);
        })
    );
  }

  const translated = await IN_FLIGHT.get(inflightKey)!;
  if (translated === sourceText) {
    return { text: sourceText, source: "fallback" };
  }
  return { text: translated, source: "api" };
}

export async function trBatch(
  locale: LocaleCode,
  sourceTexts: string[],
  options?: TranslationOptions
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const unique = Array.from(new Set(sourceTexts.filter(Boolean)));

  if (locale === "en" || unique.length === 0) {
    unique.forEach((text) => result.set(text, text));
    return result;
  }

  const unresolved: string[] = [];
  for (const text of unique) {
    const cached = getCachedTranslation(locale, text, options?.namespace);
    if (cached) {
      result.set(text, cached);
    } else {
      unresolved.push(text);
    }
  }

  if (unresolved.length === 0) return result;

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: locale,
        texts: unresolved,
        namespace: options?.namespace ?? "default",
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new Error(`Translation request failed: ${response.status}`);
    }

    const json = (await response.json()) as { translations?: string[] };
    const translated = json.translations ?? [];

    unresolved.forEach((source, index) => {
      const translatedText = translated[index] || source;
      result.set(source, translatedText);
      if (translatedText !== source) {
        STATUS.apiHitCount += 1;
        setCachedTranslation(locale, source, translatedText, options?.namespace);
      } else {
        STATUS.apiFallbackCount += 1;
      }
    });
  } catch {
    unresolved.forEach((source) => {
      result.set(source, source);
      STATUS.apiFallbackCount += 1;
    });
  }

  return result;
}
