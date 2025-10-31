import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import CartItem from "../models/CartItem.js";
import Book from "../models/Book.js";
import User from "../models/User.js";
import { sequelize } from "../config/db.js";
import { Sequelize, Op } from "sequelize";
import { getPayment, getOrder } from "../services/squareService.js";

const centsToStr = (c) => (Number(c ?? 0) / 100).toFixed(2);

export async function materializeSquareOrder({ paymentId, orderId }) {
  if (!paymentId && !orderId) return { status: "no-input" };

  // 1) Якщо є paymentId — перевіряємо COMPLETED та дістаємо orderId
  let payment = null;
  if (paymentId) {
    try {
      const p = await getPayment(paymentId);
      payment = p?.payment || p?.result?.payment || null;
    } catch {
      return { status: "pending" };
    }
    if (!payment || payment.status !== "COMPLETED") return { status: "pending" };
    if (!orderId) orderId = payment.orderId || null;

    // Ідемпотентність
    const existed = await Order.findOne({
      where: { squarePaymentId: paymentId },
      include: [{ model: OrderItem, include: [Book] }],
    });
    if (existed) return { status: "ok", order: existed };
  }

  // 2) Без orderId — ще рано
  if (!orderId) return { status: "pending" };

  // 3) Тягнемо Square Order
  let sqOrder;
  try {
    const o = await getOrder(orderId);
    sqOrder = o?.order || o?.result?.order || null;
  } catch {
    return { status: "pending" };
  }
  const userId = sqOrder?.referenceId;
  if (!userId) return { status: "no-user" };

  const user = await User.findByPk(userId);
  if (!user) return { status: "no-user" };

  const lineItems = sqOrder?.lineItems || [];
  if (!lineItems.length) return { status: "no-items" };

  const sumFromItems = lineItems.reduce((s, li) => {
    const unit = Number(li.basePriceMoney?.amount ?? 0);
    const qty = Number(li.quantity ?? 0);
    return s + unit * qty;
  }, 0);
  const totalCents =
    sqOrder?.totalMoney?.amount ??
    sqOrder?.netAmountDueMoney?.amount ??
    sumFromItems;
  const totalPrice = centsToStr(totalCents);

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
  const shippingAddress = rec?.address || null;

  let createdOrder;
  await sequelize.transaction(async (t) => {
    createdOrder = await Order.create(
      {
        userId,
        totalPrice,
        status: "completed",
        squarePaymentId: payment?.id || null,
        squareOrderId: orderId,
        shippingName,
        shippingPhone,
        shippingAddressJson: shippingAddress ? JSON.stringify(shippingAddress) : null,
      },
      { transaction: t }
    );

    const payload = [];
    for (const li of lineItems) {
      const bookId = li.note || null; // ми клали book.id у note
      const qty = Number(li.quantity || 0);
      const unit = centsToStr(li.basePriceMoney?.amount);
      if (!bookId || qty <= 0) continue;

      const [affected] = await Book.update(
        {
          stock: Sequelize.literal(`stock - ${qty}`),
          inStock: Sequelize.literal(`CASE WHEN stock - ${qty} > 0 THEN 1 ELSE 0 END`),
        },
        {
          where: { id: bookId, stock: { [Op.gte]: qty } },
          transaction: t,
        }
      );
      if (affected !== 1) continue;

      payload.push({ orderId: createdOrder.id, bookId, quantity: qty, price: unit });
    }

    if (payload.length) await OrderItem.bulkCreate(payload, { transaction: t });
    await CartItem.destroy({ where: { userId }, transaction: t });
  });

  const orderWithItems = await Order.findByPk(createdOrder.id, {
    include: [{ model: OrderItem, include: [Book] }],
  });

  return { status: "ok", order: orderWithItems };
}
