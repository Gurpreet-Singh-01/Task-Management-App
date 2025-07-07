require("dotenv").config({ path: "./.env" });
const JWT = require("jsonwebtoken");
const User = require("../models/User.model");
const asyncHandler = require("../utils/asyncHandler");
const APIError = require("../utils/APIError");

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith("Bearer") &&
        req.headers.authorization.split(" ")[1]);
    if (!token) throw new APIError(401, "Access token is required");
    const decodedToken = JWT.verify(token, process.env.ACCESS_TOKEN_JWT_SECRET);
    const user = await User.findById(decodedToken.id).select(
      "-password -refreshToken"
    );
    if (!user) throw new APIError(401, "Invalid access token");
    req.user = user;
    next();
  } catch (error) {
    if ((error.name = "TokenExpiredError"))
      throw new APIError(401, "Access token expired");
    throw new APIError(401, "Invalid access token");
  }
});

module.exports = verifyJWT;
