import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import CartItem from "../models/CartItem.js";
import Book from "../models/Book.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";
import { updateOrderStatusSchema } from "../schemas/orderSchemas.js";

const createOrder = async (req, res) => {
  const userId = req.user.id;
  const isPartner = req.user.role === "partner";

  const cartItems = await CartItem.findAll({
    where: { userId },
    include: Book,
  });

  if (!cartItems.length) {
    throw HttpError(400, "Cart is empty");
  }

  for (const item of cartItems) {
    const { Book: book, quantity } = item;

    if (book.stock < quantity) {
      throw HttpError(
        400,
        `Not enough stock for "${book.title}". Available: ${book.stock}`
      );
    }

    if (isPartner) {
      if (quantity < 5) {
        throw HttpError(
          400,
          `Minimum quantity for "${book.title}" is 5 for partner accounts`
        );
      }

      if (!book.partnerPrice) {
        throw HttpError(
          400,
          `Book "${book.title}" is not available for partner pricing`
        );
      }
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => {
    const bookPrice =
      isPartner && item.Book.partnerPrice != null
        ? item.Book.partnerPrice
        : item.Book.price;

    return sum + item.quantity * bookPrice;
  }, 0);

  const order = await Order.create({
    userId,
    totalPrice,
    status: "pending",
  });

  const orderItems = cartItems.map((item) => {
    const isUsingPartnerPrice =
      isPartner && item.Book.partnerPrice != null;

    return {
      orderId: order.id,
      bookId: item.bookId,
      quantity: item.quantity,
      price: isUsingPartnerPrice
        ? item.Book.partnerPrice
        : item.Book.price,
      pricingType: isUsingPartnerPrice ? "partner" : "standard",
    };
  });

  await OrderItem.bulkCreate(orderItems);

  for (const item of cartItems) {
    item.Book.stock -= item.quantity;
    await item.Book.save();
  }

  await CartItem.destroy({ where: { userId } });

  res.status(201).json({ message: "Order placed", orderId: order.id });
};

const getUserOrders = async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: {
      model: OrderItem,
      include: Book,
    },
    order: [["createdAt", "DESC"]],
  });

  res.json(orders);
};

const getAllOrders = async (req, res) => {
  if (req.user.role !== "admin") {
    throw HttpError(403, "Access denied. Admins only.");
  }

  const orders = await Order.findAll({
    include: [
      {
        model: OrderItem,
        include: Book,
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.json(orders);
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateOrderStatusSchema.validate(req.body);
  if (error) throw HttpError(400, error.details[0].message);

  const { status } = value;

  if (req.user.role !== "admin") {
    throw HttpError(403, "Only admins can update order status");
  }

  const order = await Order.findByPk(id);

  if (!order) {
    throw HttpError(404, "Order not found");
  }

  order.status = status;
  await order.save();

  res.json({ message: "Order status updated", order });
};

const getLatestOrder = async (req, res) => {
  const userId = req.user.id;

  const latestOrder = await Order.findOne({
    where: { userId },
    include: {
      model: OrderItem,
      include: Book,
    },
    order: [["createdAt", "DESC"]],
  });

  if (!latestOrder) {
    throw HttpError(404, "No orders found");
  }

  res.json(latestOrder);
};

const deleteOrder = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "admin") {
    throw HttpError(403, "Only admins can delete orders");
  }

  const order = await Order.findByPk(id, {
    include: OrderItem,
  });

  if (!order) {
    throw HttpError(404, "Order not found");
  }

  await OrderItem.destroy({ where: { orderId: id } });
  await Order.destroy({ where: { id } });

  res.json({ message: "Order deleted" });
};

const confirmSquareOrder = async (req, res) => {
  const userId = req.user.id;
  const isPartner = req.user.role === "partner";

  const cartItems = await CartItem.findAll({
    where: { userId },
    include: Book,
  });

  if (!cartItems.length) {
    throw HttpError(400, "Cart is empty or already processed");
  }

  for (const item of cartItems) {
    const book = item.Book;

    if (book.stock < item.quantity) {
      throw HttpError(
        400,
        `Not enough stock for "${book.title}". Available: ${book.stock}`
      );
    }

    if (isPartner) {
      if (item.quantity < 5) {
        throw HttpError(
          400,
          `Minimum quantity for "${book.title}" is 5 for partner accounts`
        );
      }

      if (!book.partnerPrice) {
        throw HttpError(
          400,
          `Book "${book.title}" is not available for partner pricing`
        );
      }
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => {
    const bookPrice =
      isPartner && item.Book.partnerPrice != null
        ? item.Book.partnerPrice
        : item.Book.price;

    return sum + item.quantity * bookPrice;
  }, 0);

  const order = await Order.create({
    userId,
    totalPrice,
    status: "completed",
  });

  const orderItems = cartItems.map((item) => {
    const isUsingPartnerPrice =
      isPartner && item.Book.partnerPrice != null;

    return {
      orderId: order.id,
      bookId: item.bookId,
      quantity: item.quantity,
      price: isUsingPartnerPrice
        ? item.Book.partnerPrice
        : item.Book.price,
      pricingType: isUsingPartnerPrice ? "partner" : "standard",
    };
  });

  await OrderItem.bulkCreate(orderItems);

  for (const item of cartItems) {
    item.Book.stock -= item.quantity;
    await item.Book.save();
  }

  await CartItem.destroy({ where: { userId } });

  try {
    await sendOrderConfirmationEmail({
      to: req.user.email,
      order,
      items: cartItems,
    });
  } catch (emailErr) {
    console.error("Email sending failed:", emailErr.message);
  }

  res.status(201).json({ message: "Order confirmed", orderId: order.id });
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