// server/config/imageVariants.js
export const VARIANTS = {
  avatars: [200, 400],
  pageImages: [400, 800, 1200],
  bookCovers: [400, 800, 1200],
  misc: [400, 800],
};

export const FORMATS = [
  { ext: "avif", sharp: (p) => p.avif({ quality: 50, effort: 4 }) },
  { ext: "webp", sharp: (p) => p.webp({ quality: 80 }) },
  {
    ext: "jpg",
    sharp: (p) => p.jpeg({ quality: 82, progressive: true, mozjpeg: true }),
  },
];
