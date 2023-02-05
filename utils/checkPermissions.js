const CustomError = require("../errors/index");

const checkPermissions = (requestUser, resourceUserId) => {
  // Return if user tries to look up his/her own id
  if (requestUser.userId === resourceUserId.toString()) {
    return;
  }
  // Return if user is Admin
  if (requestUser.role === "admin") {
    return;
  }

  // Otherwise throw an 401 error
  throw new CustomError.UnauthorizedError(
    "Not Authorized to access the resource"
  );
};

module.exports = checkPermissions;
