// server/services/squareService.js
import "dotenv/config";
import { SquareClient, SquareEnvironment } from "square"; // новий SDK
import { requireEnv } from "../config/requireEnv.js";

requireEnv();

const wantProd =
  (process.env.SQUARE_ENV || process.env.NODE_ENV) === "production";
const environment = wantProd
  ? SquareEnvironment.Production
  : SquareEnvironment.Sandbox;

// УВАГА: у новому SDK ключ називається "token", не "accessToken"
export const client = new SquareClient({
  token: (process.env.SQUARE_ACCESS_TOKEN || "").trim(),
  environment,
});

// Групи API у новому SDK (без *Api суфіксів)
const newCheckout = client.checkout;
const newPayments = client.payments;
const newOrders = client.orders;

export const locationId = (process.env.SQUARE_LOCATION_ID || "").trim();

/**
 * Стандартизовані обгортки під createPaymentLink / getPayment / getOrder,
 * що працюють і з новим SDK, і з legacy при наявності "square/legacy".
 */
export async function createPaymentLink(body) {
  // Новий SDK (v40+)
  if (newCheckout && typeof newCheckout.createPaymentLink === "function") {
    // У новому SDK відповіді відразу повертають тіло { paymentLink, ... }
    return await newCheckout.createPaymentLink(body);
  }

  // Legacy fallback
  const { Client: LegacyClient, Environment: LegacyEnv } = await import(
    "square/legacy"
  );
  const legacyClient = new LegacyClient({
    bearerAuthCredentials: { accessToken: (process.env.SQUARE_ACCESS_TOKEN || "").trim() },
    environment:
      environment === SquareEnvironment.Production
        ? LegacyEnv.Production
        : LegacyEnv.Sandbox,
  });

  if (legacyClient.paymentLinksApi?.createPaymentLink) {
    // деякі версії мали окремий paymentLinksApi
    const resp = await legacyClient.paymentLinksApi.createPaymentLink(body);
    return resp.result; // вирівнюємо формат
  }
  if (legacyClient.checkoutApi?.createPaymentLink) {
    // інші — через checkoutApi
    const resp = await legacyClient.checkoutApi.createPaymentLink(body);
    return resp.result; // вирівнюємо формат
  }

  throw new Error(
    "Square SDK: createPaymentLink() недоступний ані в новому, ані в legacy клієнті."
  );
}

// export async function getPayment(paymentId) {
//   if (newPayments && typeof newPayments.get === "function") {
//     // новий SDK: { payment }
//     return await newPayments.get({ paymentId });
//   }

//   // legacy fallback -> { result: { payment } } -> повернемо уніфіковано { payment }
//   const { Client: LegacyClient, Environment: LegacyEnv } = await import(
//     "square/legacy"
//   );
//   const lc = new LegacyClient({
//     bearerAuthCredentials: {
//       accessToken: (process.env.SQUARE_ACCESS_TOKEN || "").trim(),
//     },
//     environment:
//       environment === SquareEnvironment.Production
//         ? LegacyEnv.Production
//         : LegacyEnv.Sandbox,
//   });
//   const resp = await lc.paymentsApi.getPayment(paymentId);
//   return resp.result;
// }

// export async function getOrder(orderId) {
//   if (newOrders && typeof newOrders.get === "function") {
//     // новий SDK: { order }
//     return await newOrders.get({ orderId });
//   }

//   // legacy fallback -> { result: { order } } -> повернемо уніфіковано { order }
//   const { Client: LegacyClient, Environment: LegacyEnv } = await import(
//     "square/legacy"
//   );
//   const lc = new LegacyClient({
//     bearerAuthCredentials: { accessToken: (process.env.SQUARE_ACCESS_TOKEN || "").trim() },
//     environment:
//       environment === SquareEnvironment.Production
//         ? LegacyEnv.Production
//         : LegacyEnv.Sandbox,
//   });
//   const resp = await lc.ordersApi.retrieveOrder(orderId);
//   return resp.result;
// }
export async function getPayment(paymentId) {
  try { if (client?.payments?.getPayment) return await client.payments.getPayment({ paymentId }); } catch {}
  try { if (client?.payments?.get)       return await client.payments.get({ paymentId }); } catch {}
  try { if (client?.paymentsApi?.getPayment) return (await client.paymentsApi.getPayment(paymentId)).result; } catch {}

  const { Client: LegacyClient, Environment: LegacyEnv } = await import("square/legacy");
  const lc = new LegacyClient({
    bearerAuthCredentials: { accessToken: (process.env.SQUARE_ACCESS_TOKEN || "").trim() },
    environment: environment === SquareEnvironment.Production ? LegacyEnv.Production : LegacyEnv.Sandbox,
  });
  return (await lc.paymentsApi.getPayment(paymentId)).result;
}

export async function getOrder(orderId) {
  try { if (client?.orders?.getOrder) return await client.orders.getOrder({ orderId }); } catch {}
  try { if (client?.orders?.get)      return await client.orders.get({ orderId }); } catch {}
  try { if (client?.ordersApi?.retrieveOrder) return (await client.ordersApi.retrieveOrder(orderId)).result; } catch {}

  const { Client: LegacyClient, Environment: LegacyEnv } = await import("square/legacy");
  const lc = new LegacyClient({
    bearerAuthCredentials: { accessToken: (process.env.SQUARE_ACCESS_TOKEN || "").trim() },
    environment: environment === SquareEnvironment.Production ? LegacyEnv.Production : LegacyEnv.Sandbox,
  });
  return (await lc.ordersApi.retrieveOrder(orderId)).result;
}
