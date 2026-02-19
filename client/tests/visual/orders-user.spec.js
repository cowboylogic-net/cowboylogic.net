import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test, expect } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturePath = path.resolve(__dirname, "../fixtures/orders-user.json");
const ordersFixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

const userPayload = {
  id: "f8a6b4fb-2f74-4a62-84df-43a4d663f101",
  email: "user@example.com",
  fullName: "Regular User",
  role: "user",
  isSuperAdmin: false,
};

test("user orders page visual", async ({ page }) => {
  await page.route("**/api/auth/refresh", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "success",
        code: 200,
        data: { token: "test-token-user" },
      }),
    });
  });

  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "success", code: 200, data: userPayload }),
    });
  });

  await page.route("**/api/orders**", async (route) => {
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
  await expect(page.getByTestId("orders-page")).toHaveScreenshot("orders-user-page.png");
});
