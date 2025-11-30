const bcrypt = require("bcryptjs");
const catchError = require("../helpers/catchError");
const { checkId } = require("../helpers/validators/general");
const {
  checkIfUserExists,
  checkIfAdminOrSelf,
  validateUsername,
  checkIfUsernameTaken,
  sanitizeUser,
  validatePassword,
} = require("../helpers/validators/users");
const {
  getUserPostCount,
  updateUserById,
  deleteUserById,
} = require("../db/queries/usersQueries");

// Find user
async function getUser(req, res) {
  const userId = checkId(req.params.userId, "User ID");

  const user = await checkIfUserExists(userId);
  const postCount = await getUserPostCount(userId);
  const sanitizedUser = {
    ...sanitizeUser(user),
    post_count: postCount,
  };

  return res.status(200).json(sanitizedUser);
}

// Update user
async function updateUser(req, res) {
  const userId = checkId(req.params.userId, "User ID");
  const targetUser = await checkIfUserExists(userId);

  checkIfAdminOrSelf(targetUser, req.user);

  // Require at least one field
  if (!req.body.username && !req.body.password) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  const updateFields = {};

  // Username update
  if (req.body.username) {
    const username = validateUsername(req.body.username);
    await checkIfUsernameTaken(username);
    updateFields.username = username;
  }
  // Password update
  if (req.body.password) {
    const password = validatePassword(
      req.body.password,
      req.body.confirmPassword
    );
    updateFields.password_hash = await bcrypt.hash(password, 10);
  }

  const updatedUser = await updateUserById(userId, updateFields);
  const sanitizedUser = sanitizeUser(updatedUser);

  return res.status(200).json(sanitizedUser);
}

// Delete user
async function deleteUser(req, res) {
  const userId = checkId(req.params.userId, "User ID");

  const targetUser = await checkIfUserExists(userId);
  checkIfAdminOrSelf(targetUser, req.user);
  const deletedUser = await deleteUserById(userId);
  const sanitizedUser = sanitizeUser(deletedUser);

  return res.status(200).json(sanitizedUser);
}

module.exports = {
  getUser: catchError(getUser),
  updateUser: catchError(updateUser),
  deleteUser: catchError(deleteUser),
};
