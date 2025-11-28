const { getPostById } = require("../db/queries/postsQueries");
const {
  getCommentById: getCommentByIdQuery,
  createComment: createCommentQuery,
  updateComment: updateCommentQuery,
  deleteComment: deleteCommentQuery,
  getPostComments: getPostCommentsQuery,
} = require("../db/queries/commentsQueries");

// Helper functions
function checkId(id, type = "ID") {
  // Check if has id
  if (id === undefined || id === null) {
    const err = new Error(`${type} is required`);
    err.status = 400;
    throw err;
  }
  // Check if id is numeric
  if (isNaN(id)) {
    const err = new Error(`Invalid ${type}`);
    err.status = 400;
    throw err;
  }
  return Number(id);
}

function checkBody(body, name = "Body") {
  // Check if has body
  if (!body || !body.trim()) {
    const err = new Error(`${name} is required`);
    err.status = 400;
    throw err;
  }
  return body.trim();
}

function checkIfAuthorized(type, userId) {
  if (type.user_id !== userId) {
    const err = new Error("Not authorized");
    err.status = 403;
    throw err;
  }
}

// Main functions
async function getCommentById(req, res) {
  try {
    const commentId = checkId(req.params.commentId, "Comment ID");

    // Check if comment exists
    const foundComment = await getCommentByIdQuery(commentId);

    // If no comment
    if (!foundComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Return comment
    return res.status(200).json(foundComment);
  } catch (err) {
    console.error("Error getting comment", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function createComment(req, res) {
  try {
    const postId = checkId(req.body.postId, "Post ID");
    const body = checkBody(req.body.body, "Comment");
    const userId = req.user.id;

    // Check if post exists
    const post = await getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create comment
    const comment = await createCommentQuery(postId, userId, body);

    // Return comment
    return res.status(201).json(comment);
  } catch (err) {
    console.error("Error creating comment", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateComment(req, res) {
  try {
    const commentId = checkId(req.params.commentId, "Comment ID");
    const body = checkBody(req.body.body, "Comment");
    const userId = req.user.id;

    // Check if comment exists
    const existingComment = await getCommentByIdQuery(commentId);
    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    checkIfAuthorized(existingComment, userId);

    // Update comment
    const updatedComment = await updateCommentQuery(commentId, body, userId);

    // Return updated comment
    return res.status(200).json(updatedComment);
  } catch (err) {
    console.error("Error updating comment", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function deleteComment(req, res) {
  try {
    const commentId = checkId(req.params.commentId, "Comment ID");
    const userId = req.user.id;

    // Check if comment exists
    const comment = await getCommentByIdQuery(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    checkIfAuthorized(comment, userId);

    // Delete comment
    const deletedComment = await deleteCommentQuery(commentId, userId);

    // Return deleted comment
    return res.status(200).json(deletedComment);
  } catch (err) {
    console.error("Error deleting a comment", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getPostComments(req, res) {
  try {
    const limit = Number(req.query.limit) || 5;
    const offset = Number(req.query.offset) || 0;
    const postId = checkId(req.params.postId, "Post ID");

    // Check if post exists
    const post = await getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find comments
    const postComments = await getPostCommentsQuery(postId, limit, offset);

    // Return comments
    return res.status(200).json(postComments);
  } catch (err) {
    console.error("Error getting post comments", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
};
