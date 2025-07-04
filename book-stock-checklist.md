# 📦 Book Stock Management – Checklist

> Production-ready checklist for implementing inventory tracking (stock) in a book store project.

---

## ✅ Backend – Sequelize + Express

### 📁 Models and Migrations

- [ ] Add `stock` field to `Book` model:
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }
- [ ] Create Sequelize migration: `add-stock-to-books.js`
- [ ] Apply migration via `sequelize-cli db:migrate`

### 🧠 Controllers & Routes

- [x] Handle `stock` in `POST /books` and `PUT /books/:id` (from `req.body.stock`)
- [x] Ensure `GET /books` and `GET /books/:id` return `stock` in response
- [x] In `ordersController.js`:
  - [x] Check `book.stock >= quantity`
  - [x] Subtract quantity from book’s stock after successful order
  - [x] Save updated book stock

---

## ✅ Frontend – React + Redux + i18n

### 🧾 BookForm.jsx

- [x] Add stock input using `<BaseInput />` (type="number")
- [x] Connect to `formData.stock` in local state
- [x] Validate with Yup (`min(0).required()`)

### 📘 BookDetails.jsx

- [x] Display `In stock: X` or `Out of stock`
- [x] Disable or hide "Add to Cart" if `stock === 0`

### 📚 BookCard.jsx *(optional)*

- [x] Show badge or text with current stock on each card

### 🛒 CartPage.jsx

- [x] Before checkout, validate that `book.stock >= cartQuantity`
- [x] Show error if out of stock

### 🧩 Redux: bookSlice.js

- [x] Include `stock` in create/update/fetch reducers and thunks

### 🌐 i18n – en.json / uk.json

- [ ] Add:

  ```json
  {
    "form": {
      "stock": "Stock",
      "stockPlaceholder": "Enter available quantity"
    },
    "book": {
      "inStock": "In stock",
      "outOfStock": "Out of stock"
    },
    "validation": {
      "minStock": "Stock must be 0 or more"
    }
  }
  ```

---

---

## 🛡️ Best Practices

- [x] Use Yup validation everywhere (client + server)
- [x] Don't allow negative stock via API or UI
- [x] Keep `stock` always in sync between DB, Redux, and UI
