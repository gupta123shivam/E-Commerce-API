const Product = require("../models/Product");
const CustomError = require("../errors/index");
const { StatusCodes } = require("http-status-codes");
require("dotenv").config();
const path = require("path");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  if (!productId) {
    throw new CustomError.BadRequestError(
      "NO productId provided in parameters"
    );
  }

  const product = await Product.findOne({ _id: productId }).populate("reviews");
  if (!product) {
    throw new CustomError.NotFoundError(
      `No product was found with productId ${productId}`
    );
  }

  res.status(StatusCodes.OK).json({ product });
};

const getAllProduct = async (req, res) => {
  const products = await Product.find({});
  if (!products) {
    throw new CustomError.NotFoundError(`No products were found in database`);
  }

  res.status(StatusCodes.OK).json({ count: products.length, products });
};

const createProduct = async (req, res) => {
  // For user field in Product model
  req.body.user = req.user.userId;

  // All error checking in mongoose validators
  const product = await Product.create({ ...req.body });

  res.status(StatusCodes.CREATED).json({ msg: "Product created", product });
};

const updateProduct = async (req, res) => {
  // For user field in Product model
  req.body.user = req.user.userId;
  const { id: productId } = req.params;
  if (!productId) {
    throw new CustomError.BadRequestError(
      "No productId provided in parameters"
    );
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId },
    { ...req.body },
    { new: true, runValidators: true }
  );
  if (!product) {
    throw new CustomError.NotFoundError(
      `No product was found with productId ${productId}`
    );
  }

  res.status(StatusCodes.OK).json({ msg: "Product updated", product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  if (!productId) {
    throw new CustomError.BadRequestError(
      "No productId provided in parameters"
    );
  }

  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new CustomError.NotFoundError(
      `No product was found with productId ${productId}`
    );
  }

  await product.remove(); // We do not use delete, as remove willl trigger
  // a hook, ehere we will remove all review associated with the product
  res.status(StatusCodes.OK).json({ msg: "Product Removed", product });
};

const uploadProductImage = async (req, res) => {
  console.log(req.files);
  if (!req.files) {
    throw new CustomError.BadRequestError("No image file was uploaded");
  }

  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("File is not of correct format");
  }
  if (productImage.size > process.env.MAX_FILE_SIZE * 1024) {
    throw new CustomError.BadRequestError(
      `File size too bigger than ${process.env.MAX_FILE_SIZE}kb`
    );
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);

  return res.status(StatusCodes.CREATED).json({
    image: `/uploads/${productImage.name}`,
    msg: "Image uploaded successfully",
  });
};

const deleteAllProducts = async (req, res) => {
  const deletedProducts = await Product.deleteMany({});
  res.json({ count: deletedProducts.length, deletedProducts });
};

module.exports = {
  getSingleProduct,
  getAllProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteAllProducts,
};
