const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController");

const express = require("express");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

module.exports = router;
