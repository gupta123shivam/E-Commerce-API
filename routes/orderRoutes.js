const {
  authorizeRoles,
  authenticateUser,
} = require("../middleware/authentication");

const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require("../controllers/orderController");

const express = require("express");
const router = express.Router();

const adminPrivilages = [authenticateUser, authorizeRoles("admin")];

router
  .route("/")
  .get(adminPrivilages, getAllOrders)
  .post(authenticateUser, createOrder);

router.use(authenticateUser);
router.route("/showAllMyOrders").get(getCurrentUserOrders);
router.route("/:id").get(getSingleOrder).patch(updateOrder);

module.exports = router;
