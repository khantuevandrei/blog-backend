const { getPostById } = require("../db/queries/postsQueries");
const {
  createComment: createCommentQuery,
  getPostComments: getPostCommentsQuery,
} = require("../db/queries/commentsQueries");

async function createComment(req, res) {
  try {
    const { postId, body } = req.body;

    // Require post id & content
    if (!postId || !body) {
      return res
        .status(400)
        .json({ message: "Post id and content are required" });
    }

    // Check for empty comment
    if (!body.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // Check if post id is numeric
    const postIdNum = Number(postId);
    if (isNaN(postIdNum)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    // Check if post exists
    const post = await getPostById(postIdNum);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;

    // Create comment
    const comment = await createCommentQuery(postIdNum, userId, body);

    // Return comment
    return res.status(201).json(comment);
  } catch (err) {
    console.error("Error creating comment", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getPostComments(req, res) {
  try {
    const { postId } = req.params;

    // Require post id
    if (!postId) {
      return res.status(400).json({ message: "Post id is required" });
    }

    // Check if post id is numeric
    const postIdNum = Number(postId);
    if (isNaN(postIdNum)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    // Check if post exists
    const post = await getPostById(postIdNum);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find comments
    const postComments = await getPostCommentsQuery(postIdNum);

    // Return comments
    return res.status(200).json(postComments);
  } catch (err) {
    console.error("Error getting post comments", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { createComment };
