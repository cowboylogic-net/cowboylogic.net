# ✍️ Editable Page System

## 🇺🇸 English

Admins and superadmins can edit page content using the `EditablePage` component. Content is fetched from `/api/pages/:slug`, edited in WYSIWYG, and saved via PUT.

### Features

- Rich text formatting with internal toolbar (`EditableToolbar`)
- Image insertion via `ImageInsertModal`
- Table and link support
- Confirm before applying HTML (`ConfirmModal`)
- Draft saving via PUT `/pages/:slug/draft`
- Version viewing via `/pages/:slug/versions`

## 🇺🇦 Українською

Адміни та супер-адміни можуть редагувати контент сторінок через компонент `EditablePage`. Контент отримується з `/api/pages/:slug`, редагується у форматі WYSIWYG та зберігається через PUT.

### Можливості

- Форматування тексту через `EditableToolbar`
- Вставка зображень (`ImageInsertModal`)
- Підтримка таблиць і лінків
- Підтвердження вставки HTML (`ConfirmModal`)
- Збереження чернеток на `/pages/:slug/draft`
- Перегляд версій через `/pages/:slug/versions`
