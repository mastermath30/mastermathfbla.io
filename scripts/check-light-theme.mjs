import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const pageHero = readFileSync(new URL("../src/components/PageHero.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const button = readFileSync(new URL("../src/components/Button.tsx", import.meta.url), "utf8");

const requiredTokens = [
  "--background:",
  "--card:",
  "--text-strong:",
  "--text-default:",
  "--text-muted:",
  "--progress-track:",
  ".mm-primary-action",
  ".mm-progress-track",
];

const failures = requiredTokens.filter((token) => !css.includes(token)).map((token) => `Missing shared light-theme token: ${token}`);

if (!button.includes('"mm-primary-action')) {
  failures.push("Primary Button variant must use the opaque mm-primary-action treatment.");
}

for (const [name, source] of [["PageHero", pageHero], ["home page", home]]) {
  if (/variant="ghost"[\s\S]{0,240}(?:bg-\[var\(--theme-primary\)\]|text-white)/.test(source)) {
    failures.push(`${name} still uses a ghost button as a primary action.`);
  }
}

if (failures.length > 0) {
  console.error("Light-theme verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Light-theme shared tokens and primary action patterns verified.");
