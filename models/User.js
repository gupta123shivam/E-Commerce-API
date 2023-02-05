const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const validator = require("validator");

const ROLES_LIST = ["admin", "user", "editor"];

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "Email is not provided"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide valid email",
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  refreshToken: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: {
      values: ROLES_LIST,
      default: "user",
    },
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
});

// UserSchema.pre("save", async function () {
//   const salt = await bcryptjs.genSalt(10);
//   this.password = await bcryptjs.hash(this.password, salt);
// });

UserSchema.methods.genAccessToken = function () {
  const accessToken = jwt.sign(
    {
      user: {
        name: this.name,
        userId: this._id,
        role: this.role,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_LIFETIME }
  );
  return accessToken;
};

UserSchema.methods.genRefreshToken = async function () {
  // Creating JWT signed Refresh tokens
  const refreshToken = jwt.sign(
    {
      user: {
        name: this.name,
        userId: this._id,
        role: this.role,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_LIFETIME }
  );
  this.refreshToken = refreshToken;
  await this.save(); // to save the changes to document

  return this.refreshToken;
};

UserSchema.methods.getRefreshToken = async function () {
  if (!this.refreshToken) {
    await this.genRefreshToken();
  }
  return this.refreshToken;
};

UserSchema.methods.isPasswordMatching = async function (candidatePassword) {
  const match = await bcryptjs.compare(candidatePassword, this.password);
  return match;
};

UserSchema.methods.loggedIn = async function () {
  this.isLoggedIn = true;
  await this.save();
  return;
};

UserSchema.methods.loggedOut = async function () {
  this.isLoggedIn = false;
  await this.save();
  return;
};

UserSchema.methods.updateUserData = async function (newName, newEmail) {
  this.name = newName;
  this.email = newEmail;
  await this.save();

  return this;
};

UserSchema.methods.updateUserPassword = async function (
  email,
  newPassword,
  oldPassword
) {
  // Adding extra layer of security
  // Rechecking if email and oldPassword matches
  const match = this.isPasswordMatching(oldPassword) && this.email === email;
  if (!match) {
    throw new UnauthenticatedError(`Wrong Password or EMail`);
  }

  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(newPassword, salt);

  await this.save();

  return this;
};

UserSchema.methods.getName = function () {
  return this.name;
};

UserSchema.methods.getEmail = function () {
  return this.email;
};

UserSchema.methods.getUser = function () {
  return this.select({ password: 0 });
};

module.exports = mongoose.model("User", UserSchema);
