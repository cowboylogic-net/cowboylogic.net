import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import CartItem from "../models/CartItem.js";
import Book from "../models/Book.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import sendResponse from "../utils/sendResponse.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js"; // ⬅️ уніфікований імпорт
import { updateOrderStatusSchema } from "../schemas/orderSchemas.js";

// єдине правило привілеїв (бачать partnerPrice)
const isPrivileged = (user) =>
  user?.role === "partner" || user?.role === "admin" || user?.isSuperAdmin;

// ───────────────────────────────────────────────────────────────────────────────

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
      throw HttpError(400, `Not enough stock for "${book.title}". Available: ${book.stock}`);
    }
    if (partner) {
      if (quantity < 5) throw HttpError(400, `Minimum quantity for "${book.title}" is 5 for partner accounts`);
      if (!book.partnerPrice) throw HttpError(400, `Book "${book.title}" is not available for partner pricing`);
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => {
    const unit =
      partner && item.Book.partnerPrice != null ? item.Book.partnerPrice : item.Book.price;
    return sum + item.quantity * unit;
  }, 0);

  const order = await Order.create({ userId, totalPrice, status: "pending" });

  const orderItems = cartItems.map((item) => {
    const usingPartner = partner && item.Book.partnerPrice != null;
    return {
      orderId: order.id,
      bookId: item.bookId,
      quantity: item.quantity,
      price: usingPartner ? item.Book.partnerPrice : item.Book.price,
      pricingType: usingPartner ? "partner" : "standard",
    };
  });
  await OrderItem.bulkCreate(orderItems);

  for (const item of cartItems) {
    item.Book.stock -= item.quantity;
    await item.Book.save();
  }
  await CartItem.destroy({ where: { userId } });

  sendResponse(res, { code: 201, message: "Order placed", data: { orderId: order.id } });
};

// ───────────────────────────────────────────────────────────────────────────────

const getUserOrders = async (req, res) => {
  const privileged = isPrivileged(req.user);

  const orders = await Order.findAll({
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

  sendResponse(res, { code: 200, data: orders });
};

// ───────────────────────────────────────────────────────────────────────────────

const getAllOrders = async (req, res) => {
  // реальна перевірка робиться у requireRole, тут — як подвійний запобіжник
  if (req.user.role !== "admin" && !req.user.isSuperAdmin) {
    throw HttpError(403, "Access denied. Admins only.");
  }

  const orders = await Order.findAll({
    include: [
      {
        model: OrderItem,
        include: [Book], // admin/superAdmin можуть бачити все, включно з partnerPrice
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  sendResponse(res, { code: 200, data: orders });
};

// ───────────────────────────────────────────────────────────────────────────────

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

  sendResponse(res, { code: 200, message: "Order status updated", data: order });
};

// ───────────────────────────────────────────────────────────────────────────────

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

  if (!latestOrder) throw HttpError(404, "No orders found");

  sendResponse(res, { code: 200, data: latestOrder });
};

// ───────────────────────────────────────────────────────────────────────────────

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

// ───────────────────────────────────────────────────────────────────────────────

const confirmSquareOrder = async (req, res) => {
  const userId = req.user.id;
  const partner = req.user.role === "partner";

  const cartItems = await CartItem.findAll({
    where: { userId },
    include: Book,
  });
  if (!cartItems.length) throw HttpError(400, "Cart is empty or already processed");

  for (const item of cartItems) {
    const book = item.Book;
    if (book.stock < item.quantity) {
      throw HttpError(400, `Not enough stock for "${book.title}". Available: ${book.stock}`);
    }
    if (partner) {
      if (item.quantity < 5) {
        throw HttpError(400, `Minimum quantity for "${book.title}" is 5 for partner accounts`);
      }
      if (!book.partnerPrice) {
        throw HttpError(400, `Book "${book.title}" is not available for partner pricing`);
      }
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => {
    const unit =
      partner && item.Book.partnerPrice != null ? item.Book.partnerPrice : item.Book.price;
    return sum + item.quantity * unit;
  }, 0);

  const order = await Order.create({ userId, totalPrice, status: "completed" });

  const orderItems = cartItems.map((item) => {
    const usingPartner = partner && item.Book.partnerPrice != null;
    return {
      orderId: order.id,
      bookId: item.bookId,
      quantity: item.quantity,
      price: usingPartner ? item.Book.partnerPrice : item.Book.price,
      pricingType: usingPartner ? "partner" : "standard",
    };
  });
  await OrderItem.bulkCreate(orderItems);

  for (const item of cartItems) {
    item.Book.stock -= item.quantity;
    await item.Book.save();
  }
  await CartItem.destroy({ where: { userId } });

  try {
    await sendOrderConfirmationEmail({ to: req.user.email, order, items: cartItems });
  } catch (emailErr) {
    console.error("Email sending failed:", emailErr.message);
  }

  sendResponse(res, { code: 201, message: "Order confirmed", data: { orderId: order.id } });
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
