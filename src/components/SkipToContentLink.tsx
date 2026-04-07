"use client";

import { useTranslations } from "./LanguageProvider";

export function SkipToContentLink() {
  const { t } = useTranslations();

  return (
    <a href="#main-content" className="skip-to-content">
      {t("Skip to main content")}
    </a>
  );
}
