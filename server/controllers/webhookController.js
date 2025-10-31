// controllers/webhookController.js
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import CartItem from "../models/CartItem.js";
import Book from "../models/Book.js";
import User from "../models/User.js";
import { sequelize } from "../config/db.js";
import { getOrder, getPayment } from "../services/squareService.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";
import sendResponse from "../utils/sendResponse.js";
import { Sequelize, Op } from "sequelize";

// ⬇️ зняли ctrlWrapper і всі throw всередині
export const squareWebhookHandler = async (req, res) => {
  try {
    const event = Buffer.isBuffer(req.body)
      ? JSON.parse(req.body.toString("utf8"))
      : req.body;

    if (event?.type !== "payment.updated") {
      console.log("[WH] skip type:", event?.type);
      return sendResponse(res, { code: 200, data: { received: true } });
    }

    const payment = event?.data?.object?.payment;
    if (!payment || payment.status !== "COMPLETED") {
      console.log("[WH] skip status:", payment?.status);
      return sendResponse(res, { code: 200, data: { received: true } });
    }

    // 1) Якщо у події немає orderId — дотягуємо його з Payments API
    if (!payment.orderId) {
      try {
        const payResp = await getPayment(payment.id); // { payment }
        payment.orderId = payResp?.payment?.orderId || null;
      } catch (e) {
        console.warn("[WH] getPayment failed:", e?.body || e);
      }
      if (!payment.orderId) {
        return sendResponse(res, { code: 200, data: { received: true } });
      }
    }

    // 2) Ідемпотентність
    const existedEarly = await Order.findOne({
      where: { squarePaymentId: payment.id },
    });
    if (existedEarly) {
      return sendResponse(res, { code: 200, data: { received: true } });
    }

    // 3) Тягнемо Square-ордер
    const orderResp = await getOrder(payment.orderId); // { order }
    const sqOrder = orderResp?.order;
    const userId = sqOrder?.referenceId || null;
    if (!sqOrder || !userId) {
      console.warn("[WH] Cannot resolve user/order", {
        hasOrder: !!sqOrder,
        userId,
      });
      return sendResponse(res, { code: 200, data: { received: true } });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      console.warn("[WH] User not found by referenceId:", userId);
      return sendResponse(res, { code: 200, data: { received: true } });
    }

    const lineItems = sqOrder?.lineItems || [];
    if (!lineItems.length) {
      console.warn("[WH] No line items");
      return sendResponse(res, { code: 200, data: { received: true } });
    }

    // 4) Total
    const sumFromItems = lineItems.reduce((sum, li) => {
      const unit = Number(li.basePriceMoney?.amount ?? 0);
      const qty = Number(li.quantity ?? 0);
      return sum + unit * qty;
    }, 0);
    const totalCents =
      sqOrder?.totalMoney?.amount ??
      sqOrder?.netAmountDueMoney?.amount ??
      sumFromItems;
    const totalPrice = (Number(totalCents) / 100).toFixed(2); // "12.34"

    // 5) Адреса доставки (SHIPMENT)
    const fulfillment =
      (sqOrder.fulfillments || []).find(
        (f) => f?.shipmentDetails || f?.type === "SHIPMENT"
      ) || null;
    const ship = fulfillment?.shipmentDetails || {};
    const rec = ship?.recipient || {};
    const shippingName =
      rec?.displayName ||
      [rec?.givenName, rec?.familyName].filter(Boolean).join(" ") ||
      null;
    const shippingPhone = rec?.phoneNumber || null;
    const shippingAddress = rec?.address || null; // об'єкт з полями addressLine1/2, locality, administrativeDistrictLevel1, postalCode, country

    // 6) Транзакція: створення локального ордера, айтемів, склад, очищення кошика
    let order;
    try {
      await sequelize.transaction(async (t) => {
        order = await Order.create(
          {
            userId,
            totalPrice,
            status: "completed",
            squarePaymentId: payment.id,
            squareOrderId: payment.orderId,
            shippingName,
            shippingPhone,
            shippingAddressJson: shippingAddress
              ? JSON.stringify(shippingAddress)
              : null,
          },
          { transaction: t }
        );

        const orderItemsPayload = [];
        for (const li of lineItems) {
          const bookId = li.note || null; // ми клали book.id у note
          const quantity = Number(li.quantity || 0);
          const unitCents = Number(li.basePriceMoney?.amount ?? 0);
          const unitPrice = (unitCents / 100).toFixed(2);

          if (!bookId || quantity <= 0) {
            console.warn("[WH] skip li (no bookId/qty<=0)", { bookId, quantity });
            continue;
          }

          // 🔒 атомарне списання лише якщо вистачає складу
          const [affected] = await Book.update(
            {
              stock: Sequelize.literal(`stock - ${quantity}`),
              inStock: Sequelize.literal(
                `CASE WHEN stock - ${quantity} > 0 THEN 1 ELSE 0 END`
              ),
            },
            {
              where: { id: bookId, stock: { [Op.gte]: quantity } },
              transaction: t,
            }
          );

          if (affected !== 1) {
            console.warn(
              "[WH] Insufficient stock at fulfill time, book:",
              bookId
            );
            // не валимо транзакцію — просто пропускаємо цей айтем
            continue;
          }

          orderItemsPayload.push({
            orderId: order.id,
            bookId,
            quantity,
            price: unitPrice,
          });
        }

        if (orderItemsPayload.length) {
          await OrderItem.bulkCreate(orderItemsPayload, { transaction: t });
        } else {
          console.warn("[WH] No order items persisted after stock checks");
        }

        await CartItem.destroy({ where: { userId }, transaction: t });
      });
    } catch (txErr) {
      console.error("[WH] TX failed:", txErr?.message || txErr);
      // все одно відповідаємо 200, щоб Square не ретраїв до безкінечності
      return sendResponse(res, { code: 200, data: { received: true } });
    }

    // 7) Лист — best-effort
    try {
      const orderWithItems = await Order.findByPk(order.id, {
        include: [{ model: OrderItem, include: [Book] }],
      });

      await sendOrderConfirmationEmail({
        to: user.email,
        order,
        items: orderWithItems?.OrderItems ?? [],
      });

      const adminEmail = process.env.ADMIN_ORDERS_EMAIL;
      if (adminEmail) {
        await sendOrderConfirmationEmail({
          to: adminEmail,
          order,
          items: orderWithItems?.OrderItems ?? [],
        });
      }
    } catch (e) {
      console.warn("[WH] Email send failed:", e?.message || e);
    }

    return sendResponse(res, { code: 200, data: { received: true } });
  } catch (e) {
    console.error("[WH] fatal:", e?.body || e);
    // навіть у фатальних випадках — 200, щоб Square не робив нескінченні ретраї
    return sendResponse(res, { code: 200, data: { received: true } });
  }
};
