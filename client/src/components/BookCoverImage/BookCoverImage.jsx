import { useMemo } from "react";
import { toAbsoluteMediaUrl } from "../../utils/mediaUrl";

const BookCoverImage = ({
  src,
  variants,
  alt,
  className,
  loading = "lazy",
  decoding = "async",
}) => {
  void variants;
  const resolvedSrc = useMemo(() => toAbsoluteMediaUrl(src), [src]);

  return (
    <img
      src={resolvedSrc || undefined}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
    />
  );
};

export default BookCoverImage;
