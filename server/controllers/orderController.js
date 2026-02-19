import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import CartItem from "../models/CartItem.js";
import Book from "../models/Book.js";
import User from "../models/User.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import sendResponse from "../utils/sendResponse.js";
import { updateOrderStatusSchema } from "../schemas/orderSchemas.js";
import { sequelize } from "../config/db.js";
import { Sequelize, Op } from "sequelize";
import { materializeSquareOrder } from "../utils/materializeSquareOrder.js";

// єдине правило привілеїв (бачать partnerPrice)
const isPrivileged = (user) =>
  user?.role === "partner" || user?.role === "admin" || user?.isSuperAdmin;
const ORDER_STATUS_VALUES = new Set(["pending", "completed"]);

const parsePagination = (query) => {
  const hasPage = query?.page !== undefined;
  const hasLimit = query?.limit !== undefined;
  const paginated = hasPage || hasLimit;

  const rawPage = Number.parseInt(query?.page, 10);
  const rawLimit = Number.parseInt(query?.limit, 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(rawLimit, 100)
      : 20;

  return { paginated, page, limit, offset: (page - 1) * limit };
};

const parseStatusFilter = (status) =>
  ORDER_STATUS_VALUES.has(status) ? status : null;

const createOrder = async (req, res) => {
  const userId = req.user.id;
  const partner = req.user.role === "partner";

  const cartItems = await CartItem.findAll({
    where: { userId },
    include: Book,
  });
  if (!cartItems.length) throw HttpError(400, "Cart is empty");

  for (const { Book: book, quantity } of cartItems) {
    if (book.stock < quantity) {
      throw HttpError(
        400,
        `Not enough stock for "${book.title}". Available: ${book.stock}`
      );
    }
    if (partner) {
      if (quantity < 5)
        throw HttpError(
          400,
          `Minimum quantity for "${book.title}" is 5 for partner accounts`
        );
      if (!book.partnerPrice)
        throw HttpError(
          400,
          `Book "${book.title}" is not available for partner pricing`
        );
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => {
    const unit =
      partner && item.Book.partnerPrice != null
        ? item.Book.partnerPrice
        : item.Book.price;
    return sum + item.quantity * unit;
  }, 0);

  await sequelize.transaction(async (t) => {
    const order = await Order.create(
      { userId, totalPrice, status: "pending" },
      { transaction: t }
    );

    const orderItems = [];
    for (const item of cartItems) {
      const qty = item.quantity;

      // 🔒 атомарне списання зі складу
      const [affected] = await Book.update(
        {
          stock: Sequelize.literal(`stock - ${qty}`),
          inStock: Sequelize.literal(
            `CASE WHEN stock - ${qty} > 0 THEN 1 ELSE 0 END`
          ),
        },
        {
          where: { id: item.bookId, stock: { [Op.gte]: qty } },
          transaction: t,
        }
      );

      if (affected !== 1) {
        throw HttpError(409, `Not enough stock for "${item.Book.title}"`);
      }

      const usingPartner = partner && item.Book.partnerPrice != null;
      orderItems.push({
        orderId: order.id,
        bookId: item.bookId,
        quantity: qty,
        price: usingPartner ? item.Book.partnerPrice : item.Book.price,
        pricingType: usingPartner ? "partner" : "standard",
      });
    }

    if (orderItems.length) {
      await OrderItem.bulkCreate(orderItems, { transaction: t });
    }

    await CartItem.destroy({ where: { userId }, transaction: t });

    sendResponse(res, {
      code: 201,
      message: "Order placed",
      data: { orderId: order.id },
    });
  });
};

const getUserOrders = async (req, res) => {
  const privileged = isPrivileged(req.user);
  const { paginated, page, limit, offset } = parsePagination(req.query);
  const status = parseStatusFilter(req.query?.status);
  const where = {
    userId: req.user.id,
    ...(status ? { status } : {}),
  };

  const include = [
    {
      model: OrderItem,
      include: [
        {
          model: Book,
          attributes: { exclude: privileged ? [] : ["partnerPrice"] }, // ⬅️ не витікає
        },
      ],
    },
  ];

  if (!paginated) {
    const orders = await Order.findAll({
      where,
      include,
      order: [["createdAt", "DESC"]],
    });
    return sendResponse(res, { code: 200, data: orders });
  }

  const { rows, count } = await Order.findAndCountAll({
    where,
    include,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  sendResponse(res, {
    code: 200,
    data: {
      items: rows,
      pagination: {
        page,
        limit,
        total: count,
        hasMore: offset + rows.length < count,
      },
    },
  });
};

const getAllOrders = async (req, res) => {
  // реальна перевірка робиться у requireRole, тут — як подвійний запобіжник
  if (req.user.role !== "admin" && !req.user.isSuperAdmin) {
    throw HttpError(403, "Access denied. Admins only.");
  }

  const { paginated, page, limit, offset } = parsePagination(req.query);
  const status = parseStatusFilter(req.query?.status);
  const where = status ? { status } : {};
  const include = [
    { model: User, attributes: ["id", "email", "fullName"] },
    { model: OrderItem, include: [Book] },
  ];

  if (!paginated) {
    const orders = await Order.findAll({
      where,
      include,
      order: [["createdAt", "DESC"]],
    });
    return sendResponse(res, { code: 200, data: orders });
  }

  const { rows, count } = await Order.findAndCountAll({
    where,
    include,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  sendResponse(res, {
    code: 200,
    data: {
      items: rows,
      pagination: {
        page,
        limit,
        total: count,
        hasMore: offset + rows.length < count,
      },
    },
  });
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;

  // перевірка дублюється з middleware для безпеки
  const { error, value } = updateOrderStatusSchema.validate(req.body);
  if (error) throw HttpError(400, error.details[0].message);

  if (req.user.role !== "admin" && !req.user.isSuperAdmin) {
    throw HttpError(403, "Only admins can update order status");
  }

  const order = await Order.findByPk(id);
  if (!order) throw HttpError(404, "Order not found");

  order.status = value.status;
  await order.save();

  sendResponse(res, {
    code: 200,
    message: "Order status updated",
    data: order,
  });
};

const getLatestOrder = async (req, res) => {
  const privileged = isPrivileged(req.user);

  const latestOrder = await Order.findOne({
    where: { userId: req.user.id },
    include: [
      {
        model: OrderItem,
        include: [
          {
            model: Book,
            attributes: { exclude: privileged ? [] : ["partnerPrice"] }, // ⬅️ не витікає
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  // На момент редиректу після оплати вебхук може ще не створити локальний ордер.
  // Це НЕ помилка — просто ще немає даних. Віддаємо 204 No Content, щоб фронт продовжив полінг без error-стеків.
  if (!latestOrder) {
    return res.status(204).end();
  }

  sendResponse(res, { code: 200, data: latestOrder });
};

const deleteOrder = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "admin" && !req.user.isSuperAdmin) {
    throw HttpError(403, "Only admins can delete orders");
  }

  const order = await Order.findByPk(id, { include: OrderItem });
  if (!order) throw HttpError(404, "Order not found");

  await OrderItem.destroy({ where: { orderId: id } });
  await Order.destroy({ where: { id } });

  sendResponse(res, { code: 200, message: "Order deleted" });
};

const confirmSquareOrder = async (req, res) => {
  const { paymentId, orderId } = req.body || req.query || {};
  const result = await materializeSquareOrder({ paymentId, orderId });

  if (result.status === "ok") {
    return sendResponse(res, { code: 200, data: result.order });
  }
  if (result.status === "pending") {
    return res.status(202).json({ status: "pending" });
  }
  return res.status(204).end();
};

export default {
  createOrder: ctrlWrapper(createOrder),
  getUserOrders: ctrlWrapper(getUserOrders),
  getAllOrders: ctrlWrapper(getAllOrders),
  updateOrderStatus: ctrlWrapper(updateOrderStatus),
  deleteOrder: ctrlWrapper(deleteOrder),
  getLatestOrder: ctrlWrapper(getLatestOrder),
  confirmSquareOrder: ctrlWrapper(confirmSquareOrder),
};
