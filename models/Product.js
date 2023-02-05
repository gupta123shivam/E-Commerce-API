const mongoose = require("mongoose");
const User = require("./User");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Must provide product name"],
      maxlength: [100, "Product name can not be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Must provide product price"],
      default: 0,
    },
    description: {
      type: String,
      required: [false, "Must provide product description"],
      maxlength: [
        1000,
        "Product description can not be more than 1000 characters",
      ],
      default: "",
    },
    image: {
      type: String,
      required: [true, "Must provide product image"],
      default: "/uploads/example.jpeg",
    },
    category: {
      type: String,
      required: [true, "Must provide product category"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "Must provide roduct company"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      default: ["#222"],
      required: [true, "Must provide product colors"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: User,
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true, toObject: { virtuals: true } } }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
  // match: { rating: { $gt: 3 } },
});

// Remove all reviews associated with product
ProductSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", ProductSchema);
