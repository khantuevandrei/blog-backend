const express = require("express");
const passport = require("../config/passport-jwt");
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/usersController");

const postsRouter = require("./postsRouter");
const router = express.Router();

const authenticateJWT = passport.authenticate("jwt", { session: false });

// Users routes
router.get("/", getAllUsers);
router.get("/:userId", getUser);
router.put("/:userId", authenticateJWT, updateUser);
router.delete("/:userId", authenticateJWT, deleteUser);

// Nested posts routes
router.use("/:userId/posts", postsRouter);

module.exports = router;
