import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const envFiles = [".env", ".env.local", ".env.live"];

for (const file of envFiles) {
  if (!existsSync(file)) continue;
  const content = await readFile(file, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = rest.join("=").replace(/^["']|["']$/g, "");
    }
  }
}

const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const strategy = getArg("--strategy") || process.env.PSI_STRATEGY || "mobile";
const minScore = Number(getArg("--min-score") || process.env.PSI_MIN_SCORE || "0");
const defaultUrls = [
  "https://www.patriciosalinas.com/en/",
  "https://www.patriciosalinas.com/en/gallery/",
  "https://www.patriciosalinas.com/en/press/",
  "https://www.patriciosalinas.com/en/projects/atacama-2/",
];
const rawUrls = getArg("--urls") || getArg("--url") || process.env.PSI_URL || process.env.PSI_URLS || process.env.URL || defaultUrls.join(",");
const urls = rawUrls.split(",").map((url) => url.trim()).filter(Boolean);

if (!urls.length) {
  console.error("Set PSI_URL=https://... or pass --url https://...");
  process.exit(1);
}

const apiKey = process.env.PAGESPEED_API_KEY || "";
const endpoint = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const categories = (getArg("--categories") || process.env.PSI_CATEGORIES || "performance,accessibility,best-practices,seo")
  .split(",")
  .map((category) => category.trim())
  .filter(Boolean);

await mkdir(".lighthouseci", { recursive: true });

const slugFor = (url) => url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "url";
const metricValue = (audit) => audit?.displayValue || (audit?.numericValue != null ? String(audit.numericValue) : "n/a");
const categoryScore = (category) => {
  if (category?.score == null) return "n/a";
  return Math.round(category.score * 100);
};

let failed = false;

for (const url of urls) {
  const requestUrl = new URL(endpoint);
  requestUrl.searchParams.set("url", url);
  requestUrl.searchParams.set("strategy", strategy);
  for (const category of categories) requestUrl.searchParams.append("category", category);
  if (apiKey) requestUrl.searchParams.set("key", apiKey);

  const response = await fetch(requestUrl);
  const data = await response.json();
  if (!response.ok) {
    console.error(`PageSpeed API failed for ${url}: ${data?.error?.message || response.statusText}`);
    failed = true;
    continue;
  }

  const outputPath = resolve(".lighthouseci", `pagespeed-${strategy}-${slugFor(url)}.json`);
  await writeFile(outputPath, JSON.stringify(data, null, 2) + "\n");

  const audits = data.lighthouseResult?.audits || {};
  const resultCategories = data.lighthouseResult?.categories || {};
  const performanceScore = resultCategories.performance?.score;

  console.log(`\n${url}`);
  console.log(`PageSpeed ${strategy}`);
  console.log(`Performance: ${categoryScore(resultCategories.performance)}`);
  console.log(`Accessibility: ${categoryScore(resultCategories.accessibility)}`);
  console.log(`Best Practices: ${categoryScore(resultCategories["best-practices"])}`);
  console.log(`SEO: ${categoryScore(resultCategories.seo)}`);
  console.log(`FCP: ${metricValue(audits["first-contentful-paint"])}`);
  console.log(`LCP: ${metricValue(audits["largest-contentful-paint"])}`);
  console.log(`Speed Index: ${metricValue(audits["speed-index"])}`);
  console.log(`TBT: ${metricValue(audits["total-blocking-time"])}`);
  console.log(`CLS: ${metricValue(audits["cumulative-layout-shift"])}`);
  console.log(`Report JSON: ${outputPath}`);

  if (Number.isFinite(minScore) && performanceScore < minScore) {
    console.error(`Performance score ${categoryScore(resultCategories.performance)} is below required ${Math.round(minScore * 100)}`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
