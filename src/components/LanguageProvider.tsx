"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  const [language, setLanguage] = useState<LanguageCode>(defaultLanguage);
  const observerRef = useRef<MutationObserver | null>(null);
  const debounceRef = useRef<number | null>(null);
  const routeRef = useRef<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("mm_language") as LanguageCode | null;
    if (saved && translations[saved]) {
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mm_language", language);
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const runTranslation = () => {
      translateDocumentContent(
        language as LocaleCode,
        {
          tr: async (text, options) => (await trText(language as LocaleCode, text, options)).text,
          trBatch: (texts, options) => trBatch(language as LocaleCode, texts, options),
        },
        routeRef.current || window.location.pathname || "page"
      ).catch(() => {
        // Soft-fail: leave English fallback in place.
      });
    };

    runTranslation();

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    observerRef.current = new MutationObserver(() => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => runTranslation(), 120);
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    const updateRoute = () => {
      routeRef.current = window.location.pathname || "";
      runTranslation();
    };

    window.addEventListener("popstate", updateRoute);
    window.addEventListener("hashchange", updateRoute);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      window.removeEventListener("popstate", updateRoute);
      window.removeEventListener("hashchange", updateRoute);
    };
  }, [language]);

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

    return {
      language,
      setLanguage,
      t,
      tr,
    };
  }, [language]);

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
