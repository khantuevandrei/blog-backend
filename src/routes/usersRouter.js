const express = require("express");
const passport = require("../config/passport-jwt");
const {
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/usersController");

const router = express.Router();

const authenticateJWT = passport.authenticate("jwt", { session: false });

// Users routes
router.get("/:userId", getUser);
router.put("/:userId", authenticateJWT, updateUser);
router.delete("/:userId", authenticateJWT, deleteUser);

module.exports = router;
