const {
  getUserById,
  getUserByUsername,
} = require("../../db/queries/usersQueries");

async function checkIfUserExists(userId) {
  const user = await getUserById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return user;
}

// Validate username
function validateUsername(username) {
  if (!username)
    throw Object.assign(new Error("Username is required"), { status: 400 });

  const normalized = username.trim().toLowerCase();
  const usernameRegex = /^[a-z0-9_]{3,}$/;
  if (!usernameRegex.test(normalized)) {
    const err = new Error(
      "Username must be at least 3 characters long and may only contain letters, numbers, or underscores"
    );
    err.status = 400;
    throw err;
  }

  return normalized;
}

async function checkIfUsernameTaken(username) {
  const user = await getUserByUsername(username);
  if (user) {
    const err = new Error("Username taken");
    err.status = 409;
    throw err;
  }
}

// Sanitize user object
function sanitizeUser(user) {
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

// Validate password
function validatePassword(password, confirmPassword) {
  if (!password)
    throw Object.assign(new Error("Password is required"), { status: 400 });

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:"\\|,.<>\/?]).{8,}$/;
  if (!passwordRegex.test(password)) {
    const err = new Error(
      "Password must be at least 8 characters long and include lowercase, uppercase, number and symbol"
    );
    err.status = 400;
    throw err;
  }

  if (password !== confirmPassword) {
    const err = new Error("Passwords do not match");
    err.status = 400;
    throw err;
  }

  return password;
}

function checkIfAdminOrSelf(targetUser, requester) {
  if (requester.role !== "admin" && targetUser.id !== requester.id) {
    const err = new Error("Not authorized");
    err.status = 403;
    throw err;
  }
}

function checkIfAuthorized(type, userId) {
  if (type.user_id !== userId) {
    const err = new Error("Not authorized");
    err.status = 403;
    throw err;
  }
}

module.exports = {
  checkIfUserExists,
  validateUsername,
  checkIfUsernameTaken,
  sanitizeUser,
  validatePassword,
  checkIfAdminOrSelf,
  checkIfAuthorized,
};
