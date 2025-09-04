// client/src/utils/buildResponsiveImageHTML.js
export function buildResponsiveImageHTML({ variants = [], alt = "" }) {
  const byW = (a, b) => a.w - b.w;
  const avif = variants.filter((v) => v.fmt === "avif").sort(byW);
  const webp = variants.filter((v) => v.fmt === "webp").sort(byW);
  const jpg = variants
    .filter((v) => v.fmt === "jpg" || v.fmt === "jpeg")
    .sort(byW);
  // Універсальний fallback має бути JPEG → потім WebP → потім AVIF
  const first =
    (jpg.length && jpg[jpg.length - 1].url) ||
    (webp.length && webp[webp.length - 1].url) ||
    (avif.length && avif[avif.length - 1].url) ||
    "";
  const sizes = "(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 800px";
  const mkSrcSet = (arr) => arr.map((v) => `${v.url} ${v.w}w`).join(", ");

  if (!first) return "";

  // <picture> із двома source + <img> як fallback
  return `
    <picture>
      ${
        avif.length
          ? `<source type="image/avif" srcset="${mkSrcSet(
              avif
            )}" sizes="${sizes}" />`
          : ""
      }
      ${
        webp.length
          ? `<source type="image/webp" srcset="${mkSrcSet(
              webp
            )}" sizes="${sizes}" />`
          : ""
      }
      ${
        jpg.length
          ? `<source type="image/jpeg" srcset="${mkSrcSet(
              jpg
            )}" sizes="${sizes}" />`
          : ""
      }
      <img src="${first}" alt="${alt.replace(
    /"/g,
    "&quot;"
  )}" loading="lazy" decoding="async" />
    </picture>
  `;
}
