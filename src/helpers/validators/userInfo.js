const { findUserByUsername } = require("../../db/queries/usersQueries");

function checkUsername(username) {
  // Require username
  if (!username) {
    const err = new Error("Username is required");
    err.status = 400;
    throw err;
  }

  // Normalize
  const normalizedUsername = username.trim().toLowerCase();

  // Require pattern
  const usernameRegex = /^[a-z0-9_]{3,}$/;
  if (!usernameRegex.test(normalizedUsername)) {
    const err = new Error(
      "Username must be at least 3 characters long and may only contain letters, numbers, or underscores"
    );
    err.status = 400;
    throw err;
  }

  return normalizedUsername;
}

async function checkIfUsernameTaken(username) {
  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    const err = new Error("Username taken");
    err.status = 409;
    throw err;
  }
}

function sanitizeUser(user) {
  // Remove password
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

function checkPassword(password, confirmPassword) {
  // Require password
  if (!password) {
    const err = new Error("Password is required");
    err.status = 400;
    throw err;
  }

  // Require pattern
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:"\\|,.<>\/?]).{8,}$/;
  if (!passwordRegex.test(password)) {
    const err = new Error(
      "Password must be at least 8 characters long and include lowercase, uppercase, number and symbol"
    );
    err.status = 400;
    throw err;
  }

  // Match passwords
  if (password !== confirmPassword) {
    const err = new Error("Passwords do not match");
    err.status = 400;
    throw err;
  }

  return password;
}

module.exports = {
  checkUsername,
  checkIfUsernameTaken,
  sanitizeUser,
  checkPassword,
};
