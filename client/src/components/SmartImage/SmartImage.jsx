// client/src/components/SmartImage.jsx
export default function SmartImage({
  variants = [],
  alt = "",
  className,
  fallback: fallbackSrc,
  ...rest
}) {
  // вибираємо формат avif якщо підтримується (можна і picture)
  const byW = (a, b) => a.w - b.w;
  const avif = variants.filter((v) => v.fmt === "avif").sort(byW);
  const webp = variants.filter((v) => v.fmt === "webp").sort(byW);
  const jpg  = variants.filter((v) => v.fmt === "jpg" || v.fmt === "jpeg").sort(byW);

  // кращий fallback: великій webp (або великий avif), або зовнішній fallbackSrc
  const bestJpg  = jpg.length  ? jpg[jpg.length - 1].url   : null;
  const bestWebp = webp.length ? webp[webp.length - 1].url : null;
  const bestAvif = avif.length ? avif[avif.length - 1].url : null;
  // <img src> має бути універсальним (jpeg), інакше старі браузери зламаються
  const first = bestJpg || bestWebp || bestAvif || fallbackSrc;

  // приклад sizes: на моб. вузьке, на десктопі – ширше
  const sizes = "(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 800px";
  const mkSrcSet = (arr) => arr.map((v) => `${v.url} ${v.w}w`).join(", ");

  return (
    <picture>
      {avif.length > 0 && (
        <source type="image/avif" srcSet={mkSrcSet(avif)} sizes={sizes} />
      )}
      {webp.length > 0 && (
        <source type="image/webp" srcSet={mkSrcSet(webp)} sizes={sizes} />
      )}
      {jpg.length > 0 && (
        <source type="image/jpeg" srcSet={mkSrcSet(jpg)} sizes={sizes} />
      )}
      <img
        src={first}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className}
        {...rest}
      />
    </picture>
  );
}
