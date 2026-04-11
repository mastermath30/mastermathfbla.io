import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const coursesPath = path.join(root, "src/data/courses.ts");
const quizPath = path.join(root, "src/app/resources/quiz/[slug]/page.tsx");
const publicDir = path.join(root, "public");

const coursesText = fs.readFileSync(coursesPath, "utf8");
const quizText = fs.readFileSync(quizPath, "utf8");

const topicSlugs = [...coursesText.matchAll(/quizSlugs:\s*\[([^\]]*)\]/g)]
  .flatMap((match) => match[1].split(",").map((item) => item.trim().replace(/['"`]/g, "")))
  .filter(Boolean);

const uniqueTopicSlugs = [...new Set(topicSlugs)];
const definedQuizSlugs = [...quizText.matchAll(/^\s*"([^"]+)":\s*{/gm)].map((match) => match[1]);

const missingQuizSlugs = uniqueTopicSlugs.filter((slug) => !definedQuizSlugs.includes(slug));
const duplicateTopicSlugs = uniqueTopicSlugs.filter(
  (slug) => topicSlugs.filter((item) => item === slug).length > 1
);

const localDownloadRefs = [...coursesText.matchAll(/href:\s*"([^"]+)"/g)]
  .map((match) => match[1])
  .filter((href) => href.startsWith("/downloads/"));
const missingDownloads = localDownloadRefs.filter((href) => {
  const fullPath = path.join(publicDir, href.replace(/^\//, ""));
  return !fs.existsSync(fullPath);
});

let hasError = false;

if (missingQuizSlugs.length > 0) {
  hasError = true;
  console.error("Missing quiz definitions for topic slugs:");
  missingQuizSlugs.forEach((slug) => console.error(`- ${slug}`));
}

if (duplicateTopicSlugs.length > 0) {
  console.warn("Duplicate topic quiz slugs detected:");
  duplicateTopicSlugs.forEach((slug) => console.warn(`- ${slug}`));
}

if (missingDownloads.length > 0) {
  hasError = true;
  console.error("Missing local worksheet/download files:");
  missingDownloads.forEach((href) => console.error(`- ${href}`));
}

if (!hasError) {
  console.log(
    `Learning content integrity passed. ${uniqueTopicSlugs.length} topic quiz slugs and ${localDownloadRefs.length} local downloads validated.`
  );
}

process.exit(hasError ? 1 : 0);
