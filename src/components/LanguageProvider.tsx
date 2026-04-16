"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { defaultLanguage, LanguageCode, translations } from "@/lib/i18n";
import {
  getTranslationStatus,
  interpolate,
  registerMissingTranslationKey,
  trBatch,
  trText,
  type LocaleCode,
  type TranslationKey,
  type TranslationOptions,
} from "@/lib/translation";
import { translateDocumentContent } from "@/lib/domTranslation";

export type { LanguageCode };

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  tr: (text: string, opts?: TranslationOptions) => Promise<string>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(defaultLanguage);
  const observerRef = useRef<MutationObserver | null>(null);
  const debounceRef = useRef<number | null>(null);
  const routeRef = useRef<string>("");

  const setLanguage = useCallback((nextLanguage: LanguageCode) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mm_language", nextLanguage);
      document.documentElement.lang = nextLanguage;
      document.documentElement.dir = nextLanguage === "ar" ? "rtl" : "ltr";
    }

    setLanguageState(nextLanguage);
  }, []);

  // ─── Read persisted language once on mount ────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("mm_language") as LanguageCode | null;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  // ─── Persist language + sync html attrs ──────────────────────────────────
  useEffect(() => {
    localStorage.setItem("mm_language", language);
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }
  }, [language]);

  // ─── DOM sweep (fallback for non-t() components) ─────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // One AbortController per language. Aborted in cleanup so any in-flight
    // API call from the previous language cannot overwrite the new language's DOM.
    const abortController = new AbortController();
    const { signal } = abortController;

    const runTranslation = async () => {
      // Pause observer while the sweep runs to avoid a MutationObserver feedback
      // loop: the sweep changes characterData, which would trigger the observer,
      // which would schedule another sweep, ad infinitum.
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      try {
        await translateDocumentContent(
          language as LocaleCode,
          {
            tr: async (text, options) =>
              (await trText(language as LocaleCode, text, options)).text,
            trBatch: (texts, options) =>
              trBatch(language as LocaleCode, texts, { ...options, signal }),
          },
          routeRef.current || window.location.pathname || "page",
          signal
        );
      } catch {
        // Soft-fail: leave the current DOM text in place.
        // AbortError is expected on language switch — not a real error.
      } finally {
        // Re-attach observer only if we haven't been cleaned up (signal not aborted).
        if (!signal.aborted && observerRef.current) {
          observerRef.current.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
          });
        }
      }
    };

    // Kick off an immediate sweep for the new language.
    void runTranslation();

    // Set up MutationObserver to re-translate when new content appears (e.g., page navigation).
    observerRef.current = new MutationObserver(() => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => void runTranslation(), 120);
    });

    // Attach observer (runTranslation disconnects + reconnects around its sweep).
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    const updateRoute = () => {
      routeRef.current = window.location.pathname || "";
      void runTranslation();
    };

    window.addEventListener("popstate", updateRoute);
    window.addEventListener("hashchange", updateRoute);

    return () => {
      // CRITICAL: abort any in-flight translateDocumentContent / trBatch fetch
      // for this language before the new language's effect runs. This prevents
      // a stale API response from overwriting the new language's DOM text.
      abortController.abort();

      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      window.removeEventListener("popstate", updateRoute);
      window.removeEventListener("hashchange", updateRoute);
    };
  }, [language]);

  // ─── t() and tr() — always reflect the current language via useMemo ───────
  const value = useMemo<LanguageContextValue>(() => {
    const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
      const template = translations[language]?.[key] ?? key;
      if (!translations[language]?.[key]) {
        registerMissingTranslationKey(key);
      }
      return interpolate(template, params);
    };

    const tr = async (text: string, opts?: TranslationOptions): Promise<string> => {
      if (!text) return text;
      const dictionaryDirect = translations[language]?.[text];
      if (dictionaryDirect) {
        return dictionaryDirect;
      }
      const result = await trText(language as LocaleCode, text, opts);
      return result.text;
    };

    return { language, setLanguage, t, tr };
  }, [language, setLanguage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as Window & { __MM_TRANSLATION_STATUS__?: unknown }).__MM_TRANSLATION_STATUS__ =
      getTranslationStatus();
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

export function useTranslations() {
  return useLanguage();
}
