const express = require("express");
const passport = require("../config/passport-jwt");
const {
  getPostById,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  getPublishedPosts,
  getAuthorPosts,
} = require("../controllers/postsController");

const {
  getPostComments,
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
} = require("../controllers/commentsController");

const router = express.Router();

const authenticateJWT = passport.authenticate("jwt", { session: false });

// Posts routes
router.get("/", getPublishedPosts);
router.post("/", authenticateJWT, createPost);
router.get("/author", authenticateJWT, getAuthorPosts);
router.get("/:postId", getPostById);
router.put("/:postId", authenticateJWT, updatePost);
router.delete("/:postId", authenticateJWT, deletePost);
router.patch("/:postId/publish", authenticateJWT, publishPost);

// Nested comments routes
router.get("/:postId/comments", getPostComments);
router.post("/:postId/comments", authenticateJWT, createComment);
router.get("/:postId/comments/:commentId", getCommentById);
router.put("/:postId/comments/:commentId", authenticateJWT, updateComment);
router.delete("/:postId/comments/:commentId", authenticateJWT, deleteComment);

module.exports = router;
