const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User.model");
const JWT = require("jsonwebtoken");
const APIError = require("../utils/APIError");
const APIResponse = require("../utils/APIResponse");
const { COOKIE_OPTIONS } = require("../constants");

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
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

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if (!user) throw new APIError(404, "Invalid Access Token");
  return res
    .status(200)
    .json(new APIResponse(200, { user }, "User fetched successfully"));
});

const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) throw new APIError(404, "User not found");

  user.refreshToken = null;
  await user.save();

  return res
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .status(200)
    .json(new APIResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.clearCookie("accessToken", COOKIE_OPTIONS);
    throw new APIError(401, "Unauthorized, refresh token is required");
  }

  try {
    const decodedToken = JWT.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_JWT_SECRET
    );
    console.log(decodedToken);
    if (!decodedToken) {
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      res.clearCookie("accessToken", COOKIE_OPTIONS);
      throw new APIError(401, "Unauthorized, invalid refresh token");
    }

    const user = await User.findById(decodedToken.id);
    if (!user) {
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      res.clearCookie("accessToken", COOKIE_OPTIONS);
      throw new APIError(401, "Unauthorized, User not found");
    }

    if (user.refreshToken !== incomingRefreshToken) {
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      res.clearCookie("accessToken", COOKIE_OPTIONS);
      throw new APIError(401, "Unauthorized, refresh token is invalid or used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 1000, // 1 hour
      })
      .cookie("refreshToken", newRefreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
      })
      .json(
        new APIResponse(
          200,
          { user: updatedUser },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.clearCookie("accessToken", COOKIE_OPTIONS);
    if (error.name === "TokenExpiredError") {
      throw new APIError(401, "Refresh token expired");
    }
    throw new APIError(401, error.message || "Invalid refresh token");
  }
});

module.exports = {
  login,
  signup,
  getUser,
  logout,
  refreshAccessToken,
};
