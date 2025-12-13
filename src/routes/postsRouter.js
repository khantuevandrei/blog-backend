const express = require("express");
const passport = require("../config/passport-jwt");
const {
  getPostById,
  createPost,
  updatePost,
  deletePost,
  togglePublish,
  getPublishedPosts,
} = require("../controllers/postsController");

const commentsRouter = require("./commentsRouter");
const router = express.Router();

const authenticateJWT = passport.authenticate("jwt", { session: false });

const optionalAuthenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return next(err);

    // user will be undefined if no token or invalid token
    if (user) {
      req.user = user;
    }

    next(); // ALWAYS continue
  })(req, res, next);
};

// Posts routes
router.get("/", getPublishedPosts);
router.post("/", authenticateJWT, createPost);
router.get("/:postId", optionalAuthenticateJWT, getPostById);
router.put("/:postId", authenticateJWT, updatePost);
router.delete("/:postId", authenticateJWT, deletePost);
router.patch("/:postId/publish", authenticateJWT, togglePublish);

// Nested comments routes
router.use("/:postId/comments", commentsRouter);

module.exports = router;
