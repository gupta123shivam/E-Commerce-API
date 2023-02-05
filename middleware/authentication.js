require("dotenv").config();
const jwt = require("jsonwebtoken");
const CustomError = require("../errors/index");
const User = require("../models/User");

const authenticateUser = async (req, res, next) => {
  // Checkng if a user is logged in.
  // await loggedIn();

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new CustomError.BadRequestError(
      "Auth Headers not present or have bad configuration"
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
    if (err) {
      throw new CustomError.UnauthenticatedError("Unauthorized, Bad Token");
    }
    // Attach the user and his permissions to the req object
    req.user = {
      name: payload.user.name,
      userId: payload.user.userId,
      role: payload.user.role,
    };
    next();
  });
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.user?.role) {
      throw new CustomError.UnauthorizedError(
        "Unauthorized to access this route"
      );
    }
    const roles = [...allowedRoles];
    const result = [req.user.role] // Use spread operator if you have more than one role assigned to a single user
      .map((rol) => roles.includes(rol))
      .find((val) => val === true);

    if (!result) {
      throw new CustomError.UnauthorizedError(
        "Unauthorized to access this route"
      );
    }

    next();
  };
};

// Not capturing cookies in req.cookies
const loggedIn = ()=>{
  return async (req, res, next) => {
    const refreshToken = req.cookies.token;
    if (!refreshToken) {
      throw new CustomError.UnauthenticatedError(`Not Logged In`);
    }
  
    const foundUser = await User.findOne({ refreshToken }).select({
      password: 0,
    });
    if (!foundUser || !foundUser.isLoggedIn) {
      throw new CustomError.UnauthenticatedError(`Not Logged In`);
    }
    next();
  };
}

module.exports = { authenticateUser, authorizeRoles };
