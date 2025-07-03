# CowboyLogic Client (React Frontend)

## ✨ Overview

CowboyLogic is a full-featured React application built with Vite, Redux Toolkit, and React Router. It supports multilingual content, admin/user role segregation, dynamic routing with lazy loading, secure authentication, and form validation with Yup.

---

## 🔍 Features

### ☑️ Public Pages

- Home, About, Contact
- Bookstore and Book Details
- CLStrategies & CLPublishing informational routes
- Search results, Login/Register

### 🔐 Auth & Protected Routes

- Favorites, Cart, Orders, Profile (PrivateRoute)
- Admin dashboard (AdminRoute)
- Add/Edit books, Manage users, Newsletter admin

### ✅ Tech Stack

- **React 18** with `lazy()` + `Suspense` for all routes
- **Vite** for blazing-fast builds
- **Redux Toolkit** with modular slices/thunks/selectors
- **Yup** + `i18next`-based validation
- **i18n**: English + Spanish support out of the box
- **ESLint Flat Config** and `react-refresh` plugin

---

## 📚 Folder Structure

client/
  public/
    locales/en/translation.json
    locales/es/translation.json
  src/
    components/
    pages/
    store/
    validation/formSchemas.js
    App.jsx
    main.jsx
  .env.example
  eslint.config.js
  vite.config.js

---

## 📄 Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## 📂 Environment Variables

> See `.env.example`

```env
VITE_API_URL=https://your-api-url.com/api
```

---

## ❌ Error Handling

- Global `<ErrorBoundary />` component implemented
- Axios interceptors handle token expiration

---

## ✉️ Forms & Validation

- Centralized Yup schemas in `validation/formSchemas.js`
- Translated error messages via `i18next`
- Forms covered: login, register, book, contact, newsletter, etc.

---

## 🌐 i18n Support

- Integrated via `i18next`
- Language switcher ready
- Translations for UI, forms, and system errors

---

## 🚫 Access Control

- `PrivateRoute` and `AdminRoute` for route-level guarding
- JWT-based auth with refresh support

---

## 🔁 Future TODO

- [ ] Add Ukrainian translations
- [ ] Introduce lazy image loading and route prefetching
- [ ] Add PWA support and manifest.json
- [ ] Integrate unit tests (React Testing Library)
- [ ] Add `@` alias and update imports (planned)

---

## 🌟 Authors & License

- Built by CowboyLogic Team
- MIT License

---
