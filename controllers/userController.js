const User = require("../models/User");
const CustomError = require("../errors/index");
const { StatusCodes } = require("http-status-codes");
const bcryptjs = require("bcryptjs");
const utilFunction = require("../utils/index");

const getAllUsers = async (req, res) => {
  const users = await User.find({
    role: { $in: ["admin", "user", "editor"] },
  }).select("-password");
  if (!users) {
    throw new CustomError.NotFoundError(
      'No Users were found with roles ["admin", "user", "editor"]'
    );
  }
  res.status(StatusCodes.OK).json({ count: users.length, users });
};

const getSingleUser = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new CustomError.BadRequestError("NO userId provided in parameters");
  }

  const user = await User.find({ _id: userId }).select({ password: 0 });
  if (!user) {
    throw new CustomError.NotFoundError(
      `No user was found with userId ${userId}`
    );
  }

  // Check if user has permissions to look up for this query
  utilFunction.checkPermissions(req.user, user[0]._id);

  res.status(StatusCodes.OK).json({ user });
};

const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError("Please provid both name and email");
  }

  let foundUser = await User.findOne({ _id: req.user.userId }).select(
    "-password"
  );
  if (!foundUser || !foundUser.isLoggedIn) {
    throw new CustomError.UnauthenticatedError(
      "No user is logged in. First log in, then come here"
    );
  }

  foundUser = await foundUser.updateUserData(name, email);

  // Sending back the response
  userData = {
    name: foundUser.name,
    userId: foundUser._id,
    role: foundUser.role,
  };
  res.status(StatusCodes.OK).json({
    msg: "Current User",
    user: foundUser,
  });
};

const updateUserPassword = async (req, res) => {
  const { email, newPassword, oldPassword } = req.body;
  if (!email || !newPassword || !oldPassword) {
    throw new CustomError.BadRequestError(
      "Please provid both old, new passwords and email"
    );
  }

  let foundUser = await User.findOne({ _id: req.user.userId, email }).select(
    "-password"
  );
  if (!foundUser || !foundUser.isLoggedIn) {
    throw new CustomError.UnauthenticatedError(
      "No user is logged in. First log in, then come here"
    );
  }

  foundUser = await foundUser.updateUserPassword(
    email,
    newPassword,
    oldPassword
  );

  // Sending back the response
  userData = {
    name: foundUser.name,
    userId: foundUser._id,
    role: foundUser.role,
  };
  res.status(StatusCodes.OK).json({
    msg: "Current User",
    user: foundUser,
  });
};

const showCurrentUser = async (req, res) => {
  // const refreshToken = req.cookies.token;
  // if (!refreshToken) {
  //   throw new BadRequestError(`No token was recieved in cookie named 'token'`);
  // }

  const foundUser = await User.findOne({ _id: req.user.userId }).select(
    "-password"
  );
  if (!foundUser || !foundUser.isLoggedIn) {
    throw new UnauthenticatedError(
      "No user is logged in. First log in, then come here"
    );
  }

  // Sending back the response
  userData = {
    name: foundUser.name,
    userId: foundUser._id,
    role: foundUser.role,
  };
  res.status(StatusCodes.OK).json({
    msg: "Current User",
    user: foundUser,
  });
};

const deleteUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError(
      "Please provide both email and password"
    );
  }

  // Finding is a user with email is in database
  const foundUser = await User.findOne({ email }).select("-password");
  if (!foundUser) {
    throw new CustomError.NotFoundError(`No user with email ${email} exists.`);
  }

  // Checking if password matches
  const match = await foundUser.isPasswordMatching(password);
  if (!match) {
    throw new CustomError.UnauthenticatedError(`Wrong Password`);
  }

  await User.findOneAndRemove({ email });

  // Sending back the response
  res.status(StatusCodes.OK).json({
    msg: "User Deleted",
    user: foundUser,
  });
};

const deleteAllUser = async (req, res) => {
  const deletedUsers = await User.deleteMany({});
  res.json({ count: deletedUsers.length, deletedUsers });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserPassword,
  showCurrentUser,
  deleteUser,
  deleteAllUser,
};
