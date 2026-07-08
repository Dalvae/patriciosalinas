const CLOUDINARY_HOST = "res.cloudinary.com";
const CLOUDINARY_CLOUD = "dwxc8s4mq";

interface CloudinaryOptions {
  width?: number;
}

interface ImageDimensions {
  width: number;
  height: number;
}

function mergeTransformations(segment: string, width?: number): string {
  const parts = segment.split(",").filter(Boolean);
  const withoutAuto = parts.filter((part) => part !== "f_auto" && !part.startsWith("q_auto"));
  const withoutDimensions = width
    ? withoutAuto.filter((part) => !/^[wh]_\d+$/.test(part))
    : withoutAuto;

  return [width ? `w_${width}` : undefined, "f_auto", "q_auto", ...withoutDimensions]
    .filter(Boolean)
    .join(",");
}

export function optimizedCloudinarySrc(src: string, options: CloudinaryOptions = {}): string {
  try {
    const url = new URL(src);
    const pathParts = url.pathname.split("/").filter(Boolean);

    if (
      url.hostname !== CLOUDINARY_HOST ||
      pathParts[0] !== CLOUDINARY_CLOUD ||
      (pathParts[1] !== "image" && pathParts[1] !== "images")
    ) {
      return src;
    }

    if (pathParts[1] === "image" && pathParts[2] === "upload") {
      const transformIndex = pathParts.findIndex((part, index) => index > 2 && /^v\d+$/.test(part)) - 1;
      if (transformIndex > 2) {
        pathParts[transformIndex] = mergeTransformations(pathParts[transformIndex], options.width);
      } else {
        pathParts.splice(3, 0, mergeTransformations("", options.width));
      }
      url.pathname = `/${pathParts.join("/")}`;
      return url.toString();
    }

    if (pathParts[1] === "images" && pathParts[2]) {
      pathParts[2] = mergeTransformations(pathParts[2], options.width);
      url.pathname = `/${pathParts.join("/")}`;
      return url.toString();
    }

    return src;
  } catch {
    return src;
  }
}

export function cloudinarySrcSet(
  src: string,
  widths = [360, 480, 720]
): string | undefined {
  const entries = widths
    .map((width) => `${optimizedCloudinarySrc(src, { width })} ${width}w`)
    .filter((entry) => !entry.startsWith(`${src} `));

  return entries.length > 0 ? entries.join(", ") : undefined;
}

export function cloudinaryDimensions(src: string): ImageDimensions | undefined {
  try {
    const url = new URL(src);
    const pathParts = url.pathname.split("/").filter(Boolean);

    if (url.hostname !== CLOUDINARY_HOST || pathParts[0] !== CLOUDINARY_CLOUD) {
      return undefined;
    }

    for (const segment of pathParts) {
      const width = segment.match(/(?:^|,)w_(\d+)(?:,|$)/)?.[1];
      const height = segment.match(/(?:^|,)h_(\d+)(?:,|$)/)?.[1];
      if (width && height) {
        return { width: Number(width), height: Number(height) };
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}
