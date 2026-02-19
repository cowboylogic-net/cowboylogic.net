import { test, expect } from "@playwright/test";

const APP_ORIGIN = "http://127.0.0.1:4173";

const userPayload = {
  id: "f8a6b4fb-2f74-4a62-84df-43a4d663f101",
  email: "user@example.com",
  fullName: "Regular User",
  role: "user",
  isSuperAdmin: false,
};

const corsHeaders = {
  "access-control-allow-origin": APP_ORIGIN,
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
};

const jsonResponse = (route, status, payload) =>
  route.fulfill({
    status,
    contentType: "application/json",
    headers: corsHeaders,
    body: JSON.stringify(payload),
  });

async function configureApiBase(page) {
  await page.addInitScript(() => {
    const existing = document.querySelector('meta[name="api-base"]');
    if (existing) existing.remove();
  });
}

async function installMockedNetwork(page, apiResponder) {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const requestUrl = request.url();

    if (requestUrl.startsWith("data:") || requestUrl.startsWith("blob:")) {
      await route.continue();
      return;
    }

    const url = new URL(requestUrl);
    const isApiRequest = url.pathname.startsWith("/api/");

    if (url.origin === APP_ORIGIN && !url.pathname.startsWith("/api/")) {
      await route.continue();
      return;
    }

    if (isApiRequest) {
      const path = url.pathname.replace(/^\/api/, "");
      const handled = await apiResponder(route, {
        method: request.method(),
        path,
      });

      if (!handled) {
        await jsonResponse(route, 404, {
          status: "error",
          code: 404,
          message: `Unhandled route: ${request.method()} ${path}`,
        });
      }
      return;
    }

    await route.abort("blockedbyclient");
  });
}

async function assertNoRawSuccessKey(page) {
  const pageText = await page.locator("body").innerText();
  expect(pageText).not.toMatch(/\bsuccess\.[A-Za-z0-9_.-]+\b/);
}

test("Success redirect happy path", async ({ page }) => {
  await configureApiBase(page);

  await installMockedNetwork(page, async (route, { method, path }) => {
    if (method === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders, body: "" });
      return true;
    }

    if (method === "POST" && path.startsWith("/auth/refresh")) {
      await jsonResponse(route, 200, {
        status: "success",
        code: 200,
        data: { token: "test-token-user" },
      });
      return true;
    }

    if (method === "GET" && path.startsWith("/auth/me")) {
      await jsonResponse(route, 200, {
        status: "success",
        code: 200,
        data: userPayload,
      });
      return true;
    }

    if (method === "GET" && path.startsWith("/favorites")) {
      await jsonResponse(route, 200, {
        status: "success",
        code: 200,
        data: [],
      });
      return true;
    }

    if (method === "POST" && path.startsWith("/orders/confirm")) {
      await jsonResponse(route, 200, {
        status: "success",
        code: 200,
        data: { id: "ord-1001" },
      });
      return true;
    }

    if (method === "GET" && path.startsWith("/orders/latest")) {
      await jsonResponse(route, 200, {
        status: "success",
        code: 200,
        data: { id: "ord-1001" },
      });
      return true;
    }

    return false;
  });

  await page.goto("/success?token=fake-square-token");

  await expect(
    page.getByRole("heading", { name: /payment successful/i }),
  ).toBeVisible();
  await expect(page.getByRole("main").getByText(/order #ord-1001/i)).toBeVisible();
  await assertNoRawSuccessKey(page);
});

test("Success redirect handles webhook delay", async ({ page }) => {
  await configureApiBase(page);

  let latestCalls = 0;

  await installMockedNetwork(page, async (route, { method, path }) => {
    if (method === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders, body: "" });
      return true;
    }

    if (method === "POST" && path.startsWith("/auth/refresh")) {
      await jsonResponse(route, 200, {
        status: "success",
        code: 200,
        data: { token: "test-token-user" },
      });
      return true;
    }

    if (method === "GET" && path.startsWith("/auth/me")) {
      await jsonResponse(route, 200, {
        status: "success",
        code: 200,
        data: userPayload,
      });
      return true;
    }

    if (method === "GET" && path.startsWith("/favorites")) {
      await jsonResponse(route, 200, {
        status: "success",
        code: 200,
        data: [],
      });
      return true;
    }

    if (method === "POST" && path.startsWith("/orders/confirm")) {
      await jsonResponse(route, 500, {
        status: "error",
        code: 500,
        message: "temporary-confirm-error",
      });
      return true;
    }

    if (method === "GET" && path.startsWith("/orders/latest")) {
      latestCalls += 1;
      if (latestCalls === 1) {
        await jsonResponse(route, 404, {
          status: "error",
          code: 404,
          message: "Not found",
        });
        return true;
      }

      await jsonResponse(route, 200, {
        status: "success",
        code: 200,
        data: { id: "ord-delay-200" },
      });
      return true;
    }

    return false;
  });

  await page.goto("/success?token=fake-square-token");

  await expect(
    page.getByRole("heading", { name: /confirming your order/i }),
  ).toBeVisible();
  await expect(page.getByText(/attempt 1\/5/i)).toBeVisible();
  await expect(
    page.getByRole("main").getByText(/order #ord-delay-200/i),
  ).toBeVisible();
  await expect(page.getByText("success.errorDefault")).toHaveCount(0);
  await assertNoRawSuccessKey(page);
});

test("Success redirect without auth token shows safe missing-token screen", async ({ page }) => {
  await configureApiBase(page);

  await installMockedNetwork(page, async (route, { method, path }) => {
    if (method === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders, body: "" });
      return true;
    }

    if (method === "POST" && path.startsWith("/auth/refresh")) {
      await jsonResponse(route, 401, {
        status: "error",
        code: 401,
        message: "Unauthorized",
      });
      return true;
    }

    if (method === "GET" && path.startsWith("/auth/me")) {
      await jsonResponse(route, 401, {
        status: "error",
        code: 401,
        message: "Unauthorized",
      });
      return true;
    }

    if (method === "GET" && path.startsWith("/favorites")) {
      await jsonResponse(route, 200, {
        status: "success",
        code: 200,
        data: [],
      });
      return true;
    }

    return false;
  });

  await page.goto("/success");

  await expect(page.getByRole("heading", { name: /missing token/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /go to login/i })).toBeVisible();
  await page.waitForTimeout(5500);
  await expect(page).toHaveURL(/\/success(?:\?.*)?$/);
  await assertNoRawSuccessKey(page);
});
