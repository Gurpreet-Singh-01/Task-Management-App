const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User.model");
const JWT = require("jsonwebtoken");
const APIError = require("../utils/APIError");
const APIResponse = require("../utils/APIResponse");
const { COOKIE_OPTIONS } = require("../constants");

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.accessToken();
    const refreshToken = user.refreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new APIError(500, "Error generating tokens");
  }
};

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new APIError(400, "Username and password are required");
  }
  const user = await User.findOne({ username });
  if (!user) {
    throw new APIError(404, "User not found");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new APIError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 1000, // 1 hour
    })
    .cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    })
    .json(
      new APIResponse(
        200,
        { user: loggedInUser },
        "User logged in successfully"
      )
    );
});

const signup = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new APIError(400, "Username and password are required");
  }
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new APIError(409, "Username already exists");
  }
  const newUser = new User({ username, password });
  await newUser.save();

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    newUser._id
  );
  const loggedInUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 1000, // 1 hour
    })
    .cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    })
    .json(
      new APIResponse(
        201,
        { user: loggedInUser },
        "User signed up and logged in successfully"
      )
    );
});

module.exports = {
  login,
  signup,
};
