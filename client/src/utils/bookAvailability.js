const toAvailableStock = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
};

export const isBookAvailableForPurchase = (book, quantity = 1) => {
  const requiredQty = Math.max(1, Math.floor(Number(quantity) || 0));
  return Boolean(book?.inStock) && toAvailableStock(book?.stock) >= requiredQty;
};
