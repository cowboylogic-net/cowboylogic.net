import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test, expect } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturePath = path.resolve(__dirname, "../fixtures/orders-admin.json");
const ordersFixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

const adminPayload = {
  id: "f8a6b4fb-2f74-4a62-84df-43a4d663f201",
  email: "admin@example.com",
  fullName: "Admin User",
  role: "admin",
  isSuperAdmin: false,
};

test("admin orders page visual", async ({ page }) => {
  await page.route("**/api/auth/refresh", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "success",
        code: 200,
        data: { token: "test-token-admin" },
      }),
    });
  });

  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "success", code: 200, data: adminPayload }),
    });
  });

  await page.route("**/api/orders/all**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "success",
        code: 200,
        data: ordersFixture,
      }),
    });
  });

  await page.route("**/api/favorites**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "success", code: 200, data: [] }),
    });
  });

  await page.goto("/orders");
  await expect(page.getByTestId("orders-table")).toBeVisible();
  await expect(page.getByTestId("orders-page")).toHaveScreenshot("orders-admin-page.png");
});
