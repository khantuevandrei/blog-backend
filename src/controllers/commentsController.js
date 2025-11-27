const { getPostById } = require("../db/queries/postsQueries");
const {
  getCommentById,
  createComment: createCommentQuery,
  updateComment: updateCommentQuery,
  deleteComment: deleteCommentQuery,
  getPostComments: getPostCommentsQuery,
} = require("../db/queries/commentsQueries");

async function createComment(req, res) {
  try {
    const { postId, body } = req.body;

    // Require post id & content
    if (!postId || !body) {
      return res
        .status(400)
        .json({ message: "Post id and comment are required" });
    }

    const trimmedBody = body.trim();

    // Check for empty comment
    if (!trimmedBody) {
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
    const comment = await createCommentQuery(postIdNum, userId, trimmedBody);

    // Return comment
    return res.status(201).json(comment);
  } catch (err) {
    console.error("Error creating comment", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateComment(req, res) {
  try {
    const { commentId } = req.params;
    const { body } = req.body;

    // Require comment id and body
    if (!commentId || !body) {
      return res
        .status(400)
        .json({ message: "Comment id and comment are required" });
    }

    // Check if comment id is numeric
    const commentIdNum = Number(commentId);
    if (isNaN(commentIdNum)) {
      return res.status(400).json({ message: "Invalid comment id" });
    }

    const trimmedBody = body.trim();

    // Check for empty comment
    if (!trimmedBody) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const userId = req.user.id;

    // Check if comment exists
    const existingComment = await getCommentById(commentIdNum);
    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if authorized to update
    if (existingComment.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this comment" });
    }

    // Update comment
    const updatedComment = await updateCommentQuery(
      commentIdNum,
      trimmedBody,
      userId
    );

    // Return updated comment
    return res.status(200).json(updatedComment);
  } catch (err) {
    console.error("Error updating comment", err);
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

module.exports = { createComment, updateComment, getPostComments };
