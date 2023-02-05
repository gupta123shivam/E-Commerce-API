const {
  authorizeRoles,
  authenticateUser,
} = require("../middleware/authentication");
const {
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserPassword,
  showCurrentUser,
  deleteUser,
  deleteAllUser,
} = require("../controllers/userController");

const express = require("express");
const router = express.Router();

const adminPrivilages = [authenticateUser, authorizeRoles("admin")];

router.route("/").get(adminPrivilages, getAllUsers);

router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);
router.route("/deleteUser").delete(authenticateUser, deleteUser);

router.route("/deleteAllUser").delete(adminPrivilages, deleteAllUser);

router.route("/:userId").get(adminPrivilages, getSingleUser);

module.exports = router;
