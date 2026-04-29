import { NextResponse } from "next/server";
import { languages, type LanguageCode } from "@/lib/i18n";

type TranslateRequestBody = {
  target?: string;
  source?: string;
  texts?: string[];
  namespace?: string;
};

const languageSet = new Set(languages.map((lang) => lang.code));

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function translateWithPublicEndpoint(
  sourceText: string,
  target: LanguageCode,
  source: LanguageCode | "auto"
): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
    source
  )}&tl=${encodeURIComponent(
    target
  )}&dt=t&q=${encodeURIComponent(sourceText)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Public translation endpoint failed: ${response.status}`);
  }
  const json = (await response.json()) as unknown;
  if (!Array.isArray(json) || !Array.isArray(json[0])) {
    return sourceText;
  }

  const segments = json[0] as unknown[];
  const output = segments
    .map((segment) => (Array.isArray(segment) && typeof segment[0] === "string" ? segment[0] : ""))
    .join("");
  return decodeHtmlEntities(output || sourceText);
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  let body: TranslateRequestBody = {};
  try {
    body = (await request.json()) as TranslateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const target = (body.target ?? "en") as LanguageCode;
  const source = body.source === "auto" ? "auto" : ((body.source ?? "en") as LanguageCode);
  const texts = Array.isArray(body.texts)
    ? body.texts.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];

  if (!languageSet.has(target)) {
    return NextResponse.json({ error: "Unsupported target language" }, { status: 400 });
  }
  if (texts.length === 0) {
    return NextResponse.json({ translations: [] });
  }
  if (target === "en" && source === "en") {
    return NextResponse.json({ translations: texts });
  }

  if (!apiKey) {
    try {
      const output = await Promise.all(
        texts.map(async (sourceText) => {
          try {
            return await translateWithPublicEndpoint(sourceText, target, source);
          } catch {
            return sourceText;
          }
        })
      );
      return NextResponse.json({
        translations: output,
        meta: {
          target,
          source,
          namespace: body.namespace ?? "default",
          count: output.length,
          provider: "google-public",
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          error: "Translation service unavailable",
          details: error instanceof Error ? error.message : "unknown_error",
        },
        { status: 502 }
      );
    }
  }

  try {
    const payload: {
      q: string[];
      target: LanguageCode;
      format: "text";
      source?: LanguageCode;
    } = {
      q: texts,
      target,
      format: "text",
    };

    if (source !== "auto") {
      payload.source = source;
    }

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        {
          error: "Google Translate API request failed",
          details: errorBody,
        },
        { status: 502 }
      );
    }

    const json = (await response.json()) as {
      data?: { translations?: Array<{ translatedText?: string }> };
    };
    const translated = json.data?.translations ?? [];
    const output = texts.map((sourceText, index) => {
      const translatedText = translated[index]?.translatedText ?? sourceText;
      return decodeHtmlEntities(translatedText);
    });

    return NextResponse.json({
      translations: output,
      meta: {
        target,
        source,
        namespace: body.namespace ?? "default",
        count: output.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Translation service unavailable",
        details: error instanceof Error ? error.message : "unknown_error",
      },
      { status: 502 }
    );
  }
}
