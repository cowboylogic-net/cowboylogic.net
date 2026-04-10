const findMatchingCartItemIndex = (items, nextItem) =>
  items.findIndex(
    (item) => item?.id === nextItem?.id || item?.bookId === nextItem?.bookId,
  );

export const mergeCartItemIntoItems = (items = [], nextItem) => {
  const baseItems = Array.isArray(items) ? items : [];
  if (!nextItem || typeof nextItem !== "object") return [...baseItems];

  const matchIndex = findMatchingCartItemIndex(baseItems, nextItem);
  if (matchIndex === -1) {
    return [...baseItems, nextItem];
  }

  const mergedItems = [...baseItems];
  mergedItems[matchIndex] = nextItem;
  return mergedItems;
};

export const removeCartItemFromItems = (items = [], itemId) => {
  const baseItems = Array.isArray(items) ? items : [];
  return baseItems.filter((item) => item?.id !== itemId);
};
