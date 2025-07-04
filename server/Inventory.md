# 📦 Inventory Support for Books (Stock Management)

## ✅ Backend (Node.js + Sequelize)

| File/Component                   | Action                                                                 |
|----------------------------------|------------------------------------------------------------------------|
| `models/book.model.js`          | ➕ Add `stock` field:<br>`stock: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false }` |
| `migrations/`                   | 📁 Create migration: `add-stock-to-books.js` (if using Sequelize CLI)  |
| `controllers/book.controller.js`| 🛠️ Handle `req.body.stock` in `POST`/`PUT` requests                    |
| `routes/book.routes.js`         | 🔍 Ensure `GET` routes return `stock`                                 |
| `controllers/order.controller.js`| 🧮 On order placement:<br>1. Check `book.stock >= quantity`<br>2. Subtract from stock |

---

## ✅ Frontend (React + Redux + i18n)

| Component/File                   | Changes                                                                 |
|----------------------------------|--------------------------------------------------------------------------|
| `BookForm.jsx`                   | ➕ Add `stock` field with `<BaseInput />` and Yup validation             |
| `BookDetails.jsx`               | 👁️ Show `In stock: X` or `Out of stock`<br>Hide "Add to cart" if `stock === 0` |
| `BookCard.jsx` *(optional)*      | 📋 Show `In Stock: X` badge or text preview                             |
| `CartPage.jsx`                  | 🚫 Validate stock availability before checkout                          |
| `bookSlice.js`                  | 🧠 Add `stock` in Redux (createBook, updateBook, fetchBooks)            |
| `ordersSlice.js` *(if used)*     | 🔄 Optionally update `stock` after successful order                     |
| `i18n` (en.json / uk.json)      | 🌍 Add keys:<br>`form.stock`, `form.stockPlaceholder`,<br>`book.inStock`, `book.outOfStock`,<br>`validation.minStock` |

---

## 🔮 Scalability & Future Features

| Feature                          | Description                                                              |
|----------------------------------|---------------------------------------------------------------------------|
| 🔄 Auto update `stock`           | Via purchases in `ordersController.js`                                   |
| 🧯 Low stock alert                | Alert when `stock < 5` on admin dashboard or create `LowStockPage`       |
| 📦 Restocking support            | Add inventory endpoint or “Add Stock” button in admin panel              |
| 🚫 Hide out-of-stock books       | Optionally exclude `stock === 0` from book list or mark with badge       |

---

## 🔧 Technical Notes

- Always return `stock` in API responses (even if not displayed on frontend yet).
- Use Yup validation for production-grade reliability.
- Avoid hardcoding state logic – rely on consistent schema structure.
- Keep all input fields reusable and styled through `BaseInput`.

