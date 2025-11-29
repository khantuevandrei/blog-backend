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

const commentsRouter = require("./commentsRouter");
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
router.use("/:postId/comments", commentsRouter);

module.exports = router;
