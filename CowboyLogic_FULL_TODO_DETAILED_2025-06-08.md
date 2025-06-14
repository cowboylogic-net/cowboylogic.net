# ✅ TODO для фронту / Frontend TODO (v2025-06-12 — fully verified)

## 🔐 Аутентифікація / Authentication

- [x] Login + 2FA реалізовано (`LoginForm.jsx`, `request-code`, `verify-code`)
- [x] Google Login інтегровано (`POST /api/google`)
- [x] Role-based routing (`AdminRoute`, `PrivateRoute`)
- [x] Валідація форм через Yup:
  - [x] ResetPasswordForm
  - [x] RegisterForm
  - [x] AddBook (через BookForm)
  - [x] EditBook (через BookForm)
  - [x] Newsletter

## 🌍 Мультимовність / Internationalization

- [x] Перекладено: LoginForm, Header, LanguageSwitcher
- [x] Перекласти: Navbar, Footer, CartPage, FavoritesPage, AdminDashboard
- [x] Перекласти модалки: ConfirmModal, ImageInsertModal, TableInsertModal, LinkInsertModal
- [x] Додати i18n для Notification і повідомлень помилок (formik/yup)

- [x] Navbar
- [x] BookCard
- [x] BookDetails
- [x] CartPage
- [x] FavoritesPage
- [x] OrdersPage
- [x] Footer
- [x] Notification
- [x] EditablePage
- [x] AdminDashboard
- [x] AdminUserManagement
- [x] BookForm
- [x] SuccessPage / CancelPage
- [x] Search
- [ ] NotFoundPage

## 📦 Redux Toolkit

- [x] Реалізовано всі слайси: auth, cart, book, favorites, orders, page, notification
- [x] Всі асинхронні санки присутні: fetch, create, update, delete
- [x] Помилки обробляються через try/catch у всіх санках

## ✍️ Editable Pages

- [x] EditablePage з Toolbar
- [x] Автозбереження драфтів (через debounce + saveDraft)
- [x] `isDirty` перевірка перед збереженням
- [x] Підтримка draftContent і `/pages/:slug/draft`
- [x] Підтримка версій (`/pages/:slug/versions`)
- [x] Вставка зображень, лінків, таблиць
- [x] ConfirmModal реалізовано (але вставка HTML не підтверджується — UX-дизайн)
- [x] Переклад усіх модалок
- [x] Рефактор попереджень і банерів (cancelDraft банер не завжди ховається)

## 💳 Оплата / Payment Integration

- [x] SuccessPage, CancelPage
- [x] `paymentService.js` з create-checkout-session
- [ ] Додати spinner під час транзакцій
- [ ] Зняти книги з кошика після успішної оплати

## 🧪 Тестування / Testing

- [ ] Немає тестів у репозиторії
- [ ] Додати Vitest або React Testing Library
- [ ] Написати юніт-тести для Redux slices
- [ ] Snapshot-тести для BookList, EditablePage

## 📱 UX/UI покращення

- [ ] alt-тексти для зображень (у BookCard, Slider, Header і т.д.)
- [ ] react-helmet для SEO
- [ ] hover-ефекти (посилання, кнопки, мовні перемикачі)
- [ ] адаптивність модалок (особливо в `modals/`)
- [ ] UX Checkout: loading, redirect, error handling
- [ ] fallback сторінка 404
- [ ] Lazy load для Orders, BookDetails

## 🧩 Інше / Misc

- [x] FavoritesPage реалізована
- [x] UserManagement.jsx реалізована
- [x] Notification система є
- [x] Валідація перед збереженням редагованих сторінок (`EditablePage`)
