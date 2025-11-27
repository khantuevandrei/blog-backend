const express = require("express");
const passport = require("../config/passport-jwt");
const {
  getPostById,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  getAllPublishedPosts,
  getAllAuthorPosts,
} = require("../controllers/postsController");

const router = express.Router();

const authenticateJWT = passport.authenticate("jwt", { session: false });

router.get("/", getAllPublishedPosts);

router.post("/", authenticateJWT, createPost);

router.get("/author", authenticateJWT, getAllAuthorPosts);

router.get("/:postId", getPostById);

router.put("/:postId", authenticateJWT, updatePost);

router.delete("/:postId", authenticateJWT, deletePost);

router.patch("/:postId/publish", authenticateJWT, publishPost);

module.exports = router;
