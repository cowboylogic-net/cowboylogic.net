// controllers/webhookController.js
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import CartItem from "../models/CartItem.js";
import Book from "../models/Book.js";
import User from "../models/User.js";
import { sequelize } from "../config/db.js";
import { getOrder, getPayment } from "../services/squareService.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import sendResponse from "../utils/sendResponse.js";
import { Sequelize, Op } from "sequelize";

export const squareWebhookHandler = ctrlWrapper(async (req, res) => {
  const event = Buffer.isBuffer(req.body)
    ? JSON.parse(req.body.toString("utf8"))
    : req.body;

  if (event?.type !== "payment.updated") {
    return sendResponse(res, { code: 200, data: { received: true } });
  }

  const payment = event?.data?.object?.payment;
  if (!payment || payment.status !== "COMPLETED") {
    return sendResponse(res, { code: 200, data: { received: true } });
  }

  // 1) Якщо у події немає orderId — дотягуємо його з Payments API
  if (!payment.orderId) {
    try {
      const payResp = await getPayment(payment.id); // { payment }
      payment.orderId = payResp?.payment?.orderId || null;
    } catch {}
    if (!payment.orderId) {
      return sendResponse(res, { code: 200, data: { received: true } });
    }
  }

  // 2) Ідемпотентність: якщо вже обробляли — виходимо
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
    return sendResponse(res, {
      code: 400,
      message: "Cannot resolve user/order",
    });
  }

  const user = await User.findByPk(userId);
  if (!user) return sendResponse(res, { code: 404, message: "User not found" });

  const lineItems = sqOrder?.lineItems || [];
  if (!lineItems.length) {
    return sendResponse(res, { code: 200, message: "No line items" });
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
  const totalPrice = (Number(totalCents) / 100).toFixed(2); // збережемо як рядок "12.34"

  // 5) Адреса доставки з fulfillments (shipment)
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
  const shippingAddress = rec?.address || null; // це об'єкт з addressLine1/2, locality, administrativeDistrictLevel1, postalCode, country

  // 6) Транзакція: створення локального ордера, айтемів, склад, очищення кошика
  // 6) Транзакція: створення локального ордера, айтемів, склад, очищення кошика
  let order;
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
      if (!bookId || quantity <= 0) continue;

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
        throw new Error(
          `Insufficient stock for book ${bookId} at fulfillment time`
        );
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
    }

    await CartItem.destroy({ where: { userId }, transaction: t });
  });

  // 7) Лист — бест-ефорт
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
  } catch {}

  return sendResponse(res, { code: 200, data: { received: true } });
});
