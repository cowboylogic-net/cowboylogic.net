// client/src/services/guestCart.js
const KEY = "guestCart";

const read = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const write = (items) => {
  localStorage.setItem(KEY, JSON.stringify(items));
};

// Стандартизований item під ваш UI (має item.id і item.Book)
const makeItem = (book, quantity) => ({
  id: `g_${book.id}`,          // унікальний id для позиції в гостевому кошику
  userId: null,                // для сумісності (не використовується)
  bookId: book.id,
  quantity,
  Book: {
    id: book.id,
    title: book.title,
    author: book.author,
    price: Number(book.price ?? 0),
    partnerPrice: null,        // гостям не треба
    stock: Number(book.stock ?? 0),
    imageUrl: book.imageUrl ?? null,
  },
});

export const guestCart = {
  get() {
    return read();
  },

  add(book, qty = 1) {
    const items = read();
    const idx = items.findIndex((i) => i.Book?.id === book.id);
    if (idx >= 0) {
      items[idx].quantity += qty;
    } else {
      items.push(makeItem(book, qty));
    }
    write(items);
    return items;
  },

  update(itemId, quantity) {
    const items = read();
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx >= 0) {
      const q = Math.max(1, parseInt(quantity, 10) || 1);
      items[idx].quantity = q;
      write(items);
    }
    return read();
  },

  remove(itemId) {
    const items = read().filter((i) => i.id !== itemId);
    write(items);
    return items;
  },

  clear() {
    write([]);
    return [];
  },
};
