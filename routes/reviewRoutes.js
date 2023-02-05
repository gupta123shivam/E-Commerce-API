const {
  authorizeRoles,
  authenticateUser,
} = require("../middleware/authentication");

const {
  getSingleReview,
  getAllReview,
  createReview,
  updateReview,
  deleteReview,
  deleteAllReviews,
} = require("../controllers/reviewController");

const express = require("express");
const router = express.Router();

const adminPrivilages = [authenticateUser, authorizeRoles("admin")];

router.route("/").get(getAllReview).post(authenticateUser, createReview);

router.route("/deleteAll").delete(adminPrivilages, deleteAllReviews);

router.route("/:id").get(getSingleReview);

router.use(authenticateUser);
router.route("/:id").patch(updateReview).delete(deleteReview);

module.exports = router;
