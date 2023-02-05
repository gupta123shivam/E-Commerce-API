const Order = require("../models/Order");
const Product = require("../models/Product");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors/index");
const utilFunction = require("../utils/index");

// Stripe Payments
const stripe = require("stripe")(process.env.STRIPE_KEY);

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No items in cart");
  }

  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      "PLease provide both tax and shipppinGee"
    );
  }

  let orderItems = [];
  let subTotal = 0;
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `Product with id ${item.product} dos not exist`
      );
    }
    const { name, price, image, _id } = dbProduct;
    // Can include check for if price is in both backend and frontend
    // if (price !== item.price) {
    //   throw new CustomError.BadRequestError(
    //     `Product with id ${item.product} has a real price of ${price}.You sent price value of ${item.price}`
    //   );
    // }

    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    // Add item to order
    orderItems = [...orderItems, singleOrderItem];
    // Calculate subtotal
    subTotal += item.amount * price;
  }
  const total = subTotal + tax + shippingFee;
  const paymentIntent = await fakeStripeAPI({ amount: total, currency: "inr" });

  // Stripe Payment Intents
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: total,
  //   currency: "inr",
  // });

  const order = await Order.create({
    orderItems,
    total,
    subTotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Order Created", order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const foundOrder = await Order.findOne({ _id: orderId });
  if (!foundOrder) {
    throw new CustomError.NotFoundError(
      `No Order with id ${orderId} was found`
    );
  }

  // Checking if the current usr have neccesary permisions
  utilFunction.checkPermissions(req.user, foundOrder.user);

  res.status(StatusCodes.OK).json({ order: foundOrder });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  if (!orders) {
    throw new CustomError.NotFoundError(
      `No Order with for user with id ${req.user.userId}`
    );
  }

  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const foundOrder = await Order.findOne({ _id: orderId });
  if (!foundOrder) {
    throw new CustomError.NotFoundError(
      `No Order with id ${orderId} was found`
    );
  }

  // Checking if the current usr have neccesary permisions
  utilFunction.checkPermissions(req.user, foundOrder.user);

  // Updating order
  foundOrder.paymentIntentId = paymentIntentId;
  foundOrder.status = "paid";
  await foundOrder.save();

  res.status(StatusCodes.OK).json({ order: foundOrder });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
