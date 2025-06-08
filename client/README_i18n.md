# 🌍 i18n Customization Guide / Гайд по мультимовності

## 1. File Structure / Структура

- Config: `src/i18n.js`
- Translations: `public/locales/{lang}/translation.json`, `login.json`, etc.

## 2. Usage / Використання

```js
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<h1>{t('home.title')}</h1>
```

## 3. Add New Language / Додавання мови

- Create `public/locales/{newLang}/translation.json`
- Add language to `LanguageSwitcher.jsx`

## 4. Don't hardcode / Уникайте захардкоженого тексту

- Move labels and messages into translation files
- Modal buttons and ConfirmModal now use `t()`

## 5. Translate UI components / Переклад компонентів

- Examples: `Navbar`, `CartPage`, `Footer`, `FavoritesPage`, `Newsletter`, `ConfirmModal`
