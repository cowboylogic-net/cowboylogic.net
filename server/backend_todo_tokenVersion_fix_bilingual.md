# 🛠 Backend To-Do: Seed & Migration Fixes / Тудушник для бекенду: сидер та міграції

## 🔧 Temporary Changes (Already Applied) / Тимчасові зміни (вже застосовані)

- [x] Wrapped `seedSuperAdmin()` in `try/catch` in `server.js` to prevent server crash if `tokenVersion` is missing
- [x] Сервер запускається успішно, навіть якщо поле `tokenVersion` ще не в базі

## ⏳ To Do After Migration Server is Ready / Зробити після налаштування сервера для міграцій

1. Create a migration to add the `tokenVersion` field to the `Users` table  
   Створити міграцію для додавання поля `tokenVersion` у таблицю `Users`
2. Run `npx sequelize-cli db:migrate` to apply changes  
   Запустити `npx sequelize-cli db:migrate`, щоб застосувати зміни

## 🔁 After Migration / Після міграції

- [ ] Uncomment `tokenVersion: 0` in `seedSuperAdmin.js`  
      Розкоментувати `tokenVersion: 0` у `seedSuperAdmin.js`
- [ ] Remove `try/catch` wrapper in `server.js` around `seedSuperAdmin()`  
      Видалити `try/catch` обгортку у `server.js` навколо `seedSuperAdmin()`

📝 These steps are critical for proper JWT + tokenVersion reset flow  
Ці кроки критично важливі для коректної роботи JWT та reset через `tokenVersion`
