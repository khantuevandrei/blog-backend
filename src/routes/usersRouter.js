const express = require("express");
const passport = require("../config/passport-jwt");
const {
  getUser,
  updateUser,
  deleteUser,
  getUserPosts,
} = require("../controllers/usersController");

const router = express.Router();

const authenticateJWT = passport.authenticate("jwt", { session: false });

router.get("/:userId", getUser);
router.put("/:userId", authenticateJWT, updateUser);
router.delete("/:userId", authenticateJWT, deleteUser);
router.get("/:userId/posts", getUserPosts);

module.exports = router;
