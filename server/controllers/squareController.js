import { checkoutApi, locationId } from '../services/squareService.js';
import HttpError from '../helpers/HttpError.js';
import ctrlWrapper from '../helpers/ctrlWrapper.js';
import crypto from 'crypto';
import Joi from 'joi';

// ✅ Joi schema for array of books
const paymentSchema = Joi.array().items(
  Joi.object({
    bookId: Joi.string().required(),
    title: Joi.string().required(),
    price: Joi.number().min(0).required(),
    quantity: Joi.number().integer().min(1).required(),
  })
);

// ✅ Line item builder for Square API
const buildLineItems = (items) =>
  items.map(({ title, price, quantity }) => ({
    name: title,
    quantity: String(quantity),
    basePriceMoney: {
      amount: Math.round(price * 100), // 💰 cents
      currency: 'USD',
    },
  }));

const createPaymentHandler = async (req, res) => {
  const { error, value: items } = paymentSchema.validate(req.body, {
    convert: true, // ensure strings like "5" become numbers
  });

  if (error) {
    throw HttpError(400, error.details[0].message);
  }

  const { id: userId, role } = req.user;

  // 🔒 Partner role restriction
  if (role === 'partner') {
    const invalidItem = items.find((item) => item.quantity < 5);
    if (invalidItem) {
      throw HttpError(
        403,
        `Partners must order at least 5 items of "${invalidItem.title}"`
      );
    }
  }

  try {
    const checkoutResponse = await checkoutApi.createCheckout(locationId, {
      idempotencyKey: crypto.randomUUID(),
      order: {
        order: {
          locationId,
          lineItems: buildLineItems(items),
        },
      },
      metadata: {
        userId: String(userId),
      },
      redirectUrl:
        process.env.NODE_ENV === 'production'
          ? process.env.SQUARE_SUCCESS_URL
          : 'http://localhost:5173/success',
    });

    const checkoutUrl = checkoutResponse.result.checkout?.checkoutPageUrl;

    if (!checkoutUrl) {
      throw HttpError(500, 'Missing checkout URL from Square');
    }

    res.json({ checkoutUrl });
  } catch (err) {
    console.error('💥 Square error:', err.response?.data || err.message);
    throw HttpError(500, 'Failed to create payment');
  }
};

export const createPaymentLink = ctrlWrapper(createPaymentHandler);
