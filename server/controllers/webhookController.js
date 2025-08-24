// controllers/webhookController.js
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import CartItem from "../models/CartItem.js";
import Book from "../models/Book.js";
import User from "../models/User.js";
import { Sequelize } from "sequelize";
import { sequelize } from "../config/db.js";
import { ordersApi } from "../services/squareService.js"; // 👈 додати
import { sendOrderConfirmationEmail } from "../services/emailService.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import sendResponse from "../utils/sendResponse.js";

export const squareWebhookHandler = ctrlWrapper(async (req, res) => {
  const event = Buffer.isBuffer(req.body)
    ? JSON.parse(req.body.toString("utf8"))
    : req.body;
  console.log("📥 Square Webhook received:", event?.type);

  if (event?.type !== "payment.updated") {
    return sendResponse(res, { code: 200, data: { received: true } });
  }

  const payment = event?.data?.object?.payment;
  if (!payment || payment.status !== "COMPLETED") {
    return sendResponse(res, { code: 200, data: { received: true } });
  }

  // РАННЯ ідемпотентність: якщо такий платіж уже обробили — виходимо
  const existedEarly = await Order.findOne({
    where: { squarePaymentId: payment.id },
  });
  if (existedEarly) {
    return sendResponse(res, { code: 200, data: { received: true } });
  }

  // 1) userId: metadata -> referenceId з Square-ордера
  let userId = payment?.metadata?.userId || null;

  if (!userId && payment?.orderId) {
    try {
      const { result } = await ordersApi.retrieveOrder(payment.orderId);
      userId = result?.order?.referenceId || null;

      // 2) будуємо локальний ордер з фактичних позицій із Square
      const sqOrder = result?.order;
      if (!userId || !sqOrder) {
        return sendResponse(res, {
          code: 400,
          message: "Cannot resolve user/order",
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return sendResponse(res, { code: 404, message: "User not found" });
      }

      const lineItems = sqOrder?.lineItems || [];
      if (!lineItems.length) {
        return sendResponse(res, { code: 200, message: "No line items" });
      }

      // total беремо із Square (в центах) і переводимо у DECIMAL string
      const totalCents = sqOrder?.totalMoney?.amount ?? 0;
      const totalPrice = (Number(totalCents) / 100).toFixed(2);

      // const existed = await Order.findOne({
      //   where: { squarePaymentId: payment.id },
      // });
      // if (existed)
      //   return sendResponse(res, { code: 200, data: { received: true } });

      // ПЕРЕД цим рядком уже є: totalPrice, lineItems, user, userId, sqOrder тощо.

      let order; // 👈 потрібно, щоб використати за межами транзакції (для листа)

      await sequelize.transaction(async (t) => {
        // 1) створюємо локальний ордер
        order = await Order.create(
          {
            userId,
            totalPrice,
            status: "completed",
            squarePaymentId: payment.id,
            squareOrderId: payment.orderId,
          },
          { transaction: t }
        );

        // 2) мапимо lineItems → payload для OrderItem
        const orderItemsPayload = [];
        for (const li of lineItems) {
          const bookId = li.note || null;
          const quantity = Number(li.quantity || 0);
          const unitCents = li.basePriceMoney?.amount ?? 0;
          const unitPrice = (Number(unitCents) / 100).toFixed(2);
          if (!bookId || quantity <= 0) continue;

          orderItemsPayload.push({
            orderId: order.id,
            bookId,
            quantity,
            price: unitPrice, // одинична ціна
            // pricingType не передаємо — у моделі стоїть default "standard"
          });

          // 3) атомарно декрементимо склад
          await Book.update(
            {
              stock: Sequelize.literal(`GREATEST(stock - ${quantity}, 0)`),
              inStock: Sequelize.literal(
                `CASE WHEN stock - ${quantity} > 0 THEN 1 ELSE 0 END`
              ),
            },
            { where: { id: bookId }, transaction: t }
          );
        }

        // 4) зберігаємо айтеми одним батчем
        if (orderItemsPayload.length) {
          await OrderItem.bulkCreate(orderItemsPayload, { transaction: t });
        }

        // 5) чистимо кошик юзера
        await CartItem.destroy({ where: { userId }, transaction: t });
      });

      // ...далі БЕЗ транзакції — бест-ефорт лист:
      try {
        // добираємо позиції з назвами (Book) для листа
        const orderWithItems = await Order.findByPk(order.id, {
          include: [{ model: OrderItem, include: [Book] }],
        });
        await sendOrderConfirmationEmail({
          to: user.email,
          order,
          items: orderWithItems?.OrderItems ?? [],
        });
      } catch (emailErr) {
        console.error("Email send error:", emailErr?.message || emailErr);
      }

      return sendResponse(res, { code: 200, data: { received: true } });
    } catch (e) {
      // Якщо впали через дубль (UNIQUE), вважаємо ідемпотентним успіхом
      if (e?.name === "SequelizeUniqueConstraintError") {
        console.warn("Duplicate webhook (unique constraint) for", payment.id);
        return sendResponse(res, { code: 200, data: { received: true } });
      }
      console.error(
        "Failed to retrieve Square order:",
        e?.body || e?.message || e
      );
      // Дамо 500, щоб Square ретрайнув вебхук (корисно, якщо це тимчасова помилка мережі)
      return sendResponse(res, {
        code: 500,
        message: "Order retrieval failed",
      });
    }
  }

  // Якщо чомусь userId все одно не визначився
  return sendResponse(res, { code: 400, message: "Missing userId" });
});
