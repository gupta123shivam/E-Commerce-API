const Review = require("../models/Review");
const Product = require("../models/Product");
const CustomError = require("../errors/index");
const { StatusCodes } = require("http-status-codes");
const utilFunction = require("../utils/index");

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(
      `No review was found with reviewId ${reviewId}`
    );
  }

  res.status(StatusCodes.OK).json({ review });
};

const getAllReview = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name company price",
  });

  if (!reviews) {
    throw new CustomError.NotFoundError(`No reviews were found in database`);
  }

  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

const createReview = async (req, res) => {
  // For user field in Review model, product provided by frontend
  req.body.user = req.user.userId;
  const { product: productId } = req.body;

  if (!productId) {
    throw new CustomError.BadRequestError(`You did not provide any productId`);
  }

  // Checking if product exist or not
  const foundProduct = await Product.findOne({ _id: productId });
  if (!foundProduct) {
    throw new CustomError.NotFoundError(`No product with id: ${productId}`);
  }

  // Checking if user has already provided the review
  const alreadSubmitted = await Review.findOne({
    user: req.user.userId,
    product: productId,
  });
  if (alreadSubmitted) {
    throw new CustomError.BadRequestError(
      `You have already provided the review for the productId: ${productId}`
    );
  }

  // All error checking in mongoose validators
  const review = await Review.create({ ...req.body });

  res.status(StatusCodes.CREATED).json({ msg: "Review created", review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;

  // Checking if review exist or not
  const foundReview = await Review.findOne({ _id: reviewId });
  if (!foundReview) {
    throw new CustomError.BadRequestError(
      `No review exist with reviewId ${reviewId}`
    );
  }

  // Checking if this user is same one who provided the review to be updated
  utilFunction.checkPermissions(req.user, foundReview.user);

  // If there is any error in values, mongoose will throw that error
  foundReview.title = title;
  foundReview.comment = comment;
  foundReview.rating = rating;
  const review = await foundReview.save();

  res.status(StatusCodes.OK).json({ msg: "Review Updated", review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;

  // Checking if review exist or not
  const foundReview = await Review.findOne({ _id: reviewId });
  if (!foundReview) {
    throw new CustomError.BadRequestError(
      `No review exist with reviewId ${reviewId}`
    );
  }

  utilFunction.checkPermissions(req.user, foundReview.user);
  await foundReview.remove();

  res
    .status(StatusCodes.OK)
    .json({ msg: "Review Removed", review: foundReview });
};

const deleteAllReviews = async (req, res) => {
  const deletedReviews = await Review.deleteMany({});
  res
    .status(StatusCodes.OK)
    .json({ count: deletedReviews.length, reviews: deletedReviews });
};

// To get all reviews attached with the given pdoductId
const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;

  // const foundProduct = await Product.findOne({ _id: productId });
  // if (!foundProduct) {
  //   throw new CustomError.NotFoundError(
  //     `Product with productId ${productId} does not exist`
  //   );
  // }

  const reviews = await Review.find({ product: productId });
  if (!reviews) {
    throw new CustomError.NotFoundError(
      `Did not have any reviews for the product with productId ${productId}`
    );
  }

  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

module.exports = {
  getSingleReview,
  getAllReview,
  createReview,
  updateReview,
  deleteReview,
  deleteAllReviews,
  getSingleProductReviews,
};
