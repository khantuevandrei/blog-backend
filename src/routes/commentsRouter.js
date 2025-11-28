const express = require("express");
const passport = require("../config/passport-jwt");
const {
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
} = require("../controllers/commentsController");

const router = express.Router();

const authenticateJWT = passport.authenticate("jwt", { session: false });

router.post("/", authenticateJWT, createComment);
router.get("/post/:postId", getPostComments);
router.get("/:commentId", getCommentById);
router.put("/:commentId", authenticateJWT, updateComment);
router.delete("/:commentId", authenticateJWT, deleteComment);

module.exports = router;
