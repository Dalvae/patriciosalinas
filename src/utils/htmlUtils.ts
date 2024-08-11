import { JSDOM } from "jsdom";

export function extractImagesFromHTML(
  html: string
): Array<{
  src: string;
  alt: string;
  width: number | string;
  height: number | string;
}> {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const images = Array.from(doc.querySelectorAll("img"));
  return images.map((img) => ({
    src: img.src,
    alt: img.alt,
    width: img.width || img.getAttribute("width") || "300",
    height: img.height || img.getAttribute("height") || "200",
  }));
}

export function replaceImagesWithPlaceholders(html: string): string {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const images = doc.querySelectorAll("img");
  images.forEach((img) => {
    const div = doc.createElement("div");
    div.className = "image-placeholder";
    img.parentNode?.replaceChild(div, img);
  });
  return dom.serialize();
}
