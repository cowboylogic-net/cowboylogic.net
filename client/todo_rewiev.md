# 📝 todo_reviews.md – Реалізація функціоналу відгуків (ratings / reviews)

> 📦 Повна підтримка рецензій (оцінка, коментар) до книги. Працює лише для авторизованих користувачів.

---

## 🔁 BACKEND

### 📁 1. Створити модель `Review` у Sequelize

```js
// models/Review.js
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define("Review", {
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  Review.associate = (models) => {
    Review.belongsTo(models.User, { foreignKey: "userId" });
    Review.belongsTo(models.Book, { foreignKey: "bookId" });
  };

  return Review;
};
```

### 🛠 2. Додати міграцію для `Review`

```bash
npx sequelize-cli model:generate --name Review --attributes rating:integer,comment:text,userId:integer,bookId:integer
```

### 🌐 3. API routes `/api/reviews`

- POST `/api/reviews` — створити новий відгук
- GET `/api/reviews/:bookId` — отримати всі відгуки по книзі
- DELETE `/api/reviews/:id` — видалити свій відгук
- (опціонально) PUT `/api/reviews/:id` — редагувати свій відгук

### 🧠 4. Контролер `reviewController.js`

```js
const { Review, User } = require("../models");

exports.createReview = async (req, res) => {
  const { rating, comment, bookId } = req.body;
  const userId = req.user.id;
  const review = await Review.create({ rating, comment, bookId, userId });
  res.status(201).json(review);
};

exports.getReviewsForBook = async (req, res) => {
  const { bookId } = req.params;
  const reviews = await Review.findAll({
    where: { bookId },
    include: [{ model: User, attributes: ["email"] }],
  });
  res.json(reviews);
};
```

---

## 💻 FRONTEND

### 🧩 5. Створити `reviewSlice.js`

- `createReviewThunk`
- `fetchReviewsThunk`
- `deleteReviewThunk`

### 📂 6. Redux Store

```js
state.review = {
  items: {},
  isLoading: false,
  error: null,
};
```

### 🧠 7. Селектори

- `selectReviewsByBookId(bookId)`
- `selectReviewsLoading`
- `selectReviewError`

### 🧱 8. Компоненти

- `ReviewForm.jsx` — форма з полями: `rating`, `comment`
- `ReviewList.jsx` — список відгуків (з email автора)

Використовується у `BookDetails.jsx`.

---

## 🔐 9. Middleware (auth)

- Усі POST/DELETE роути захищаються через `protect` (`req.user.id`)
- Не дозволяється залишити більше 1 відгуку на одну книгу від одного користувача

---

## 🧪 10. Тести (опціонально)

- `Vitest`: тести на thunks (`createReview`, `fetchReviews`)
- Snapshot UI тест: `ReviewList`

---

## 🧼 11. Покращення UX

- Показати повідомлення через `notificationSlice`
- Блокування кнопки під час сабміту
- `Loader` поки вантажаться відгуки

---

🔚 **Після реалізації цей пункт повністю закриє масштабування Redux для нових фіч.**
