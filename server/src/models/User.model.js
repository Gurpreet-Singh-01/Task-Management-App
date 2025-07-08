const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 20,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 100,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hashing Password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Matching Password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// JWT TOKENS
userSchema.methods.generateAccessToken = function () {
  return JWT.sign(
    { id: this._id, username: this.username },
    process.env.ACCESS_TOKEN_JWT_SECRET,
    { expiresIn: "1h" }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return JWT.sign({ id: this._id }, process.env.REFRESH_TOKEN_JWT_SECRET, {
    expiresIn: "3d",
  });
};

const User = model("User", userSchema);
module.exports = User;
