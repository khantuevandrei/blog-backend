require("dotenv").config();
require("../config/passport-local");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser } = require("../db/queries/usersQueries");
const catchError = require("../helpers/catchError");
const {
  checkUsername,
  checkIfUsernameTaken,
  sanitizeUser,
  checkPassword,
} = require("../helpers/validators/userInfo");

// Register user
async function registerUser(req, res) {
  const username = checkUsername(req.body.username);
  await checkIfUsernameTaken(username);

  const password = checkPassword(req.body.password, req.body.confirmPassword);
  const password_hash = await bcrypt.hash(password, 10);
  const userInfo = await createUser(username, password_hash);
  const sanitizedUserInfo = sanitizeUser(userInfo);

  return res.status(201).json(sanitizedUserInfo);
}

// Login user
function loginUser(req, res, next) {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return next(err);

    // Invalid credentials
    if (!user) {
      return res
        .status(401)
        .json({ message: info.message || "Invalid credentials" });
    }

    // Sanitize user, don't send password
    const sanitizedUser = sanitizeUser(user);

    // Sign JWT
    const token = jwt.sign(sanitizedUser, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });

    // Return user info + token
    return res.json({ user: sanitizedUser, token });
  })(req, res, next);
}

module.exports = { registerUser: catchError(registerUser), loginUser };
