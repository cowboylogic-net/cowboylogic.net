Ронбук прод-міграцій (MySQL @ HostGator, Sequelize CLI)
0) Що вважаємо “готовим” (ти це вже маєш)

server/.sequelizerc (посилається на config/config.cjs і папки migrations/, seeders/).

server/config/config.cjs (CommonJS, читає DATABASE_* із .env).

Усі міграції в server/migrations/ як .cjs (не .js).

Сидер супер-адміна в server/seeders/...-seed-super-admin.cjs.

У server.js немає автоматичного sequelize.sync() і немає автосідів (на проді MIGRATE_WITH_SYNC не встановлюємо).

1) Підготовка PROD середовища

Створи/онови server/.env для продакшна (точні назви змінних):

DATABASE_USERNAME=...
DATABASE_PASSWORD=...
DATABASE_HOST=gator3263.hostgator.com
DATABASE_NAME=...
DATABASE_PORT=3306
NODE_ENV=production
PORT=5000

ADMIN_EMAIL/ADMIN_PASSWORD додавай лише якщо плануєш запускати сидер супер-адміна на проді.

Дозволь підключення до MySQL з прод-хоста
У HostGator cPanel → Remote MySQL додай публічний IP сервера, з якого виконуватимеш міграції (прод-сервер або твоя робоча машина — залежно де запускаєш команди).

Бекап перед міграцією (обов’язково)
У HostGator phpMyAdmin → вибери БД → Export → Quick → Go (завантаж *.sql).

Рекомендовано робити бекап кожен раз перед будь-якою прод-міграцією.

2) Перевірка конекту до PROD БД

Запускаємо з папки server/:

cd C:\RogerProject\cowboylogic.net\server
node -v    # має бути v22.12.0 (в тебе так і є)
npm i      # якщо не ставили залежності на цьому хості

Створи файл scripts/test-db.mjs:

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 3306),
    dialect: "mysql",
    logging: false,
  }
);

try {
  await sequelize.authenticate();
  console.log("✅ Connected OK");
} catch (e) {
  console.error("❌ Connection failed:", e?.message || e);
} finally {
  await sequelize.close();
}

Запуск:

node .\scripts\test-db.mjs

Очікування: ✅ Connected OK.

Якщо ETIMEDOUT/ECONNREFUSED → перевір Remote MySQL allowlist/порт.
Якщо ER_ACCESS_DENIED_ERROR → логін/пароль/привілеї користувача.
Якщо SSL-помилка → додай у config.cjs dialectOptions.ssl (і CA, якщо потрібно).

3) Запуск прод-міграцій

Всі команди — з папки server/.

3.1 Мігрувати схему
npx sequelize-cli db:migrate --env production

sequelize-cli візьме креденшали з server/config/config.cjs (який читає DATABASE_* із server/.env).

Перевір статус:

npx sequelize-cli db:migrate:status --env production

Очікування: up на всіх create-*.

3.2 Посіяти супер-адміна (за потреби)

Якщо акаунт уже існує, сидер коректно напише, що він є, і нічого не змінить.

$env:ADMIN_EMAIL="admin@yourdomain.com"
$env:ADMIN_PASSWORD="StrongPass123!"
npx sequelize-cli db:seed:all --env production

4) Запуск самого застосунку на проді

Переконайся, що:

немає MIGRATE_WITH_SYNC=1 у .env.

server.js не викликає seedSuperAdmin().

Старт (на вибір):

# простий старт

node server.js

# або PM2 (якщо ставитимеш)

pm2 start server.js --name cowboylogic-api
pm2 save

Smoke-тести:

Логін супер-адміном.

GET /api/books, /api/pages/:slug, базові CRUDи, кошик/замовлення.

5) Типові операції після релізу
5.1 Перевірити схему/стан
npx sequelize-cli db:migrate:status --env production

5.2 Відкотити останню міграцію (у разі проблем)

⚠️ Відкатить схему, але не поверне дані, що вже були змінені міграцією (видалені стовпці/таблиці не відновлять вміст). Завжди май бекап.

npx sequelize-cli db:migrate:undo --env production

5.3 Відкотити всі міграції (тільки якщо потрібно)
npx sequelize-cli db:migrate:undo:all --env production

6) Як додавати нові зміни у майбутньому

Створити міграцію (CLI згенерує каркас як .js → перейменуй на .cjs):

npx sequelize-cli migration:generate --name add-new-field-to-users --env development

# переіменуй файл у server/migrations/...add-new-field-to-users.cjs

Заповни міграцію (приклади):

Додати стовпець:

// up:
await queryInterface.addColumn("Users", "marketingOptIn", { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false });
// down:
await queryInterface.removeColumn("Users", "marketingOptIn");

Змінити тип:

await queryInterface.changeColumn("Books", "description", { type: Sequelize.TEXT("long"), allowNull: true });

Додати індекс:

await queryInterface.addIndex("Orders", ["status", "createdAt"], { name: "idx_orders_status_created_at" });

Додати FK:

await queryInterface.addConstraint("OrderItems", {
  fields: ["orderId"],
  type: "foreign key",
  name: "fk_orderitems_order",
  references: { table: "Orders", field: "id" },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});


Проганяєш локально (--env development), потім — на PROD:

# локально
npm run db:migrate
# прод
npx sequelize-cli db:migrate --env production


Не змінюй таблиці через sequelize.sync({ alter: true }) — це зламає контрольованість схеми.

7) Аварійні сценарії і точні дії

ERROR: Cannot find "config\config.cjs"
Перевір server/.sequelizerc:

module.exports = {
  "config": path.resolve("config", "config.cjs"),
  "models-path": path.resolve("models"),
  "migrations-path": path.resolve("migrations"),
  "seeders-path": path.resolve("seeders"),
};


Запускати команди з папки server/.

ReferenceError: require/module is not defined
Файл міграції/сидера в .js у проєкті з "type":"module".
→ Перейменуй на .cjs.

Duplicate key name ...
Назви індексів мають бути унікальні і стабільні. Додавай name: "idx_table_col_001".
Якщо фейл лишив “хвіст” (таблиця/індекс частково створені) — дропни артефакт у БД і проганяй знову.

ETIMEDOUT/ECONNREFUSED
Remote MySQL: додай публічний IP хоста у cPanel → Remote MySQL → Add Access Host. Перевір порт 3306 і фаєрвол.

ER_ACCESS_DENIED_ERROR
Перевір логін/пароль; перевір, що користувач має привілеї на конкретну БД (GRANT ALL ON dbname.*).

SSL-помилка (сертифікат)
Додай у server/config/config.cjs:

dialectOptions: {
  ssl: { require: true, rejectUnauthorized: true, ca: process.env.DB_SSL_CA }
}

і помісти CA у .env (як один рядок) або файл і зчитай його.

8) Політика сидів на проді

Сидер супер-адміна — один раз на порожню БД. Якщо користувач уже є — сидер пропустить (у тебе так зроблено).

Тестові дані (книги/сторінки) — не запускати на проді (або зроби окремий сидер і не викликай його на PRODUCTION).

9) Швидка “шпаргалка” команд (PowerShell, запускати з server/)
# Перевірка конекту
node .\scripts\test-db.mjs

# Міграції
npx sequelize-cli db:migrate --env production
npx sequelize-cli db:migrate:status --env production
npx sequelize-cli db:migrate:undo --env production

# Сіди (за потреби)
$env:ADMIN_EMAIL="admin@yourdomain.com"
$env:ADMIN_PASSWORD="StrongPass123!"
npx sequelize-cli db:seed:all --env production
npx sequelize-cli db:seed:undo:all --env production







# Шпаргалка рутинних дій (з server/)

Перевірити, чи є що мігрувати:

npx sequelize-cli db:migrate:status --env production


Застосувати міграції:

npx sequelize-cli db:migrate --env production


Відкотити останню (у разі термінового фіксу):

npx sequelize-cli db:migrate:undo --env production


Посіяти (лише якщо треба, і сидер ідемпотентний):

$env:ADMIN_EMAIL="admin@yourdomain.com"
$env:ADMIN_PASSWORD="StrongPass123!"
npx sequelize-cli db:seed:all --env production

Коротка пам’ятка “коли саме в релізі”

Є нова міграція в репо → перед запуском нової версії проганяєш db:migrate на PROD.

Піднімаєш нове середовище (stage/prod після міграції на інший хост) → одразу db:migrate, далі — старт сервера.

Після recovery з бекапу → db:migrate (якщо status показує down).

Якщо сумніваєшся — проганяй db:migrate:status: це дає фактичну відповідь без здогадів.