import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import CartItem from "../models/CartItem.js";
import Book from "../models/Book.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";

// Stripe
// import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createOrder = async (req, res) => {
  const userId = req.user.id;

  const cartItems = await CartItem.findAll({
    where: { userId },
    include: Book,
  });

  if (!cartItems.length) {
    throw HttpError(400, "Cart is empty");
  }
  // 🔍 Перевірка наявності достатньої кількості книжок на складі
  for (const item of cartItems) {
    if (item.Book.stock < item.quantity) {
      throw HttpError(
        400,
        `Not enough stock for "${item.Book.title}". Available: ${item.Book.stock}`
      );
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + item.quantity * item.Book.price;
  }, 0);

  const order = await Order.create({
    userId,
    totalPrice,
    status: "pending",
  });

  const orderItems = cartItems.map((item) => ({
    orderId: order.id,
    bookId: item.bookId,
    quantity: item.quantity,
    price: item.Book.price,
  }));

  await OrderItem.bulkCreate(orderItems);
  // 📉 Зменшуємо stock після підтвердженого замовлення
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
  const { status } = req.body;

  if (req.user.role !== "admin") {
    throw HttpError(403, "Only admins can update order status");
  }

  if (!["pending", "completed"].includes(status)) {
    throw HttpError(400, "Invalid status value");
  }

  const order = await Order.findByPk(id);

  if (!order) {
    throw HttpError(404, "Order not found");
  }

  order.status = status;
  await order.save();

  res.json({ message: "Order status updated", order });
};

// ✅ Stripe Checkout session (нова функція)
const createCheckoutSession = async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw HttpError(400, "No items provided");
  }

  const line_items = items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.title,
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: "https://clpit.duckdns.org/success",
    cancel_url: "https://clpit.duckdns.org/cancel",
    // success_url: "http://localhost:5173/success",
    // cancel_url: "http://localhost:5173/cancel",
  });

  res.status(200).json({ url: session.url });
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

  // Видаляємо пов'язані позиції
  await OrderItem.destroy({ where: { orderId: id } });

  // Видаляємо саме замовлення
  await Order.destroy({ where: { id } });

  res.json({ message: "Order deleted" });
};

const confirmStripeOrder = async (req, res) => {
  const userId = req.user.id;

  const cartItems = await CartItem.findAll({
    where: { userId },
    include: Book,
  });

  if (!cartItems.length) {
    throw HttpError(400, "Cart is empty or already processed");
  }
  // 🔍 Перевірка наявності достатньої кількості книжок
  for (const item of cartItems) {
    if (item.Book.stock < item.quantity) {
      throw HttpError(
        400,
        `Not enough stock for "${item.Book.title}". Available: ${item.Book.stock}`
      );
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + item.quantity * item.Book.price;
  }, 0);

  const order = await Order.create({
    userId,
    totalPrice,
    status: "completed",
  });

  const orderItems = cartItems.map((item) => ({
    orderId: order.id,
    bookId: item.bookId,
    quantity: item.quantity,
    price: item.Book.price,
  }));

  await OrderItem.bulkCreate(orderItems);
  // 📉 Зменшуємо залишок
  for (const item of cartItems) {
    item.Book.stock -= item.quantity;
    await item.Book.save();
  }

  await CartItem.destroy({ where: { userId } });

  // Надсилаємо email
  try {
    await sendOrderConfirmationEmail({
      to: req.user.email,
      order,
      items: cartItems,
    });
  } catch (emailErr) {
    console.error("Email sending failed:", emailErr.message);
    // Можеш не кидати помилку — замовлення все одно створене
  }

  res.status(201).json({ message: "Order confirmed", orderId: order.id });
};
export default {
  createOrder: ctrlWrapper(createOrder),
  getUserOrders: ctrlWrapper(getUserOrders),
  getAllOrders: ctrlWrapper(getAllOrders),
  updateOrderStatus: ctrlWrapper(updateOrderStatus),
  createCheckoutSession: ctrlWrapper(createCheckoutSession),
  confirmStripeOrder: ctrlWrapper(confirmStripeOrder),
  deleteOrder: ctrlWrapper(deleteOrder),
  getLatestOrder: ctrlWrapper(getLatestOrder),
};
