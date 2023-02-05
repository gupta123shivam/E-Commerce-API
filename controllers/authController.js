const User = require("../models/User");
const CustomError = require("../errors/index");
const { StatusCodes } = require("http-status-codes");
const bcryptjs = require("bcryptjs");

const registerUser = async function (req, res) {
  const { name, password, email } = req.body;

  // Checking if a user with same email exist or not
  const foundUser = await User.findOne({ email }).select({ password: 0 });
  if (foundUser) {
    throw new CustomError.BadRequestError(
      `A user with Email ${email} alresdy exists, Please provide another email`
    );
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  // Password hashing
  const salt = bcryptjs.genSaltSync(10);
  const hashedPwd = bcryptjs.hashSync(password, salt);

  const user = await User.create({ name, password: hashedPwd, email, role });

  // Attaching cookie to the response
  const refreshToken = await user.getRefreshToken();
  res.cookie("token", refreshToken, {
    httpOnly: true,
    // sameSite: "None",
    secure: process.env.NODE_ENV === "production" ? false : true,
    // signed: true,
    maxAge: 24 * 60 * 60 * 1000,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  // Sending back the response
  userData = { name: user.name, userId: user._id, role: user.role };
  res.status(StatusCodes.CREATED).json({
    msg: "User created",
    user: userData,
    token: refreshToken,
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide both email and password");
  }

  // Finding is a user with email is in database
  const foundUser = await User.findOne({ email });
  if (!foundUser) {
    throw new CustomError.UnauthenticatedError(`No user with email ${email} exists.`);
  }
  // Checking if password matches
  const match = await foundUser.isPasswordMatching(password);
  if (!match) {
    throw new CustomError.UnauthenticatedError(`Wrong Password`);
  }

  // Set isLoggedIn to true;
  await foundUser.loggedIn();

  // Attaching cookie to the response
  const refreshToken = await foundUser.getRefreshToken();
  res.cookie("token", refreshToken, {
    httpOnly: true,
    // sameSite: "None",,
    secure: process.env.NODE_ENV === "production" ? false : true,
    // signed: true,
    maxAge: 24 * 60 * 60 * 1000,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  // Sending back the response
  res.status(StatusCodes.OK).json({
    msg: "User Logged In",
    token: refreshToken,
  });
};

const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.token;
  if (!refreshToken) {
    throw new CustomError.BadRequestError(`No token was recieved in cookie named 'token'`);
  }

  const foundUser = await User.findOne({ refreshToken }).select({
    password: 0,
  });
  if (!foundUser || !foundUser.isLoggedIn) {
    throw new CustomError.BadRequestError("No user is logged in. First log in, to logout");
  }

  // Set isLoggedIn to false;
  await foundUser.loggedOut();

  res.cookie("token", "random", {
    httpOnly: true,
    // sameSite: "None",,
    secure: process.env.NODE_ENV === "production" ? false : true,
    // signed: true,
    maxAge: 24 * 60 * 60 * 1000,
    expires: new Date(Date.now() + 5000),
  });

  // Sending back the response
  userData = { name: foundUser.name, userId: foundUser._id, role: foundUser.role };
  res.status(StatusCodes.OK).json({
    msg: "User Logged Out",
    user: foundUser,
  });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
