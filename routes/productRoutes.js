const {
  authorizeRoles,
  authenticateUser,
} = require("../middleware/authentication");

const {
  getSingleProduct,
  getAllProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteAllProducts,
} = require("../controllers/productController");

const { getSingleProductReviews } = require("../controllers/reviewController");

const express = require("express");
const router = express.Router();

const adminPrivilages = [authenticateUser, authorizeRoles("admin")];

router.route("/").get(getAllProduct).post(adminPrivilages, createProduct);

router.route("/uploadImage").post(adminPrivilages, uploadProductImage);
router.route("/deleteAll").delete(adminPrivilages, deleteAllProducts);

router.route("/:id").get(getSingleProduct);

// router.use(adminPrivilages);
router
  .route("/:id")
  .patch(adminPrivilages, updateProduct)
  .delete(adminPrivilages, deleteProduct);

router.route("/:id/reviews").get(getSingleProductReviews);

module.exports = router;
