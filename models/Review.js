const mongoose = require("mongoose");
const Product = require("./Product");
const User = require("./User");

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Please provide a review rating"],
      default: 3,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide review title"],
      maxlength: [100, "Please keep title length less than 100 characters"],
    },
    comment: {
      type: String,
      trim: true,
      required: [true, "Please provide review text"],
      maxlength: [
        200,
        "Please keep review text length less than 200 characters",
      ],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Must provide a user referrer"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Must provide a product referrer"],
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (err) {
    throw new Error(err.message)
  }
  return result;
};

ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("Review", ReviewSchema);
