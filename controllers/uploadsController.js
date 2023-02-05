const { StatusCodes } = require("http-status-codes");
const path = require("path");
const customError = require("../errors/index");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const uploadProductImageLocal = async (req, res) => {
  const productImage = req.files.image;

  if (!productImage) {
    throw new customError.BadRequestError("No image file was uploaded");
  }
  if ((!productImage, mimetype.startsWith("image"))) {
    throw new customError.BadRequestError("File is not of correct format");
  }
  if (productImage.size > process.env.MAX_FILE_SIZE * 1024) {
    throw new customError.BadRequestError("File size too big");
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  return res.status(StatusCodes.CREATED).json({
    image: { src: `/uploads/${productImage.name}` },
    msg: "Image uploaded successfully",
  });
};

const uploadProductImageCloud = async (req, res) => {
  const productImage = req.files.image;

  const result = await cloudinary.uploader.upload(productImage.tempFilePath, {
    use_filename: true,
    folder: "07-file-upload",
  });
  fs.unlinkSync(productImage.tempFilePath);
  return res.status(StatusCodes.CREATED).json({
    image: { src: `${result.secure_url}` },
    msg: "Image uploaded successfully",
  });
};

module.exports = {
  uploadProductImageCloud,
};
