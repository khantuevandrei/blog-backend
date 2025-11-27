require("dotenv").config();

const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByUsername } = require("../db/queries/userQueries");

async function registerUser(req, res) {
  const { username, password } = req.body;

  // Require username & password
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    // Check if username already exists
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const userInfo = await createUser(username, hashedPassword);
    // Return user info
    return res.status(201).json(userInfo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

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
    const sanitizedUser = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    // Sign JWT
    const token = jwt.sign(sanitizedUser, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });

    // Return user info + token
    return res.json({ user: sanitizedUser, token });
  })(req, res, next);
}

module.exports = { registerUser, loginUser };
