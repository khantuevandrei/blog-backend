const { getCommentById } = require("../../db/queries/commentsQueries");

// Check if comment exists
async function checkIfCommentExists(commentId) {
  const comment = await getCommentById(commentId);
  if (!comment) {
    const err = new Error("Comment not found");
    err.status = 404;
    throw err;
  }
  return comment;
}

// Check if comment belongs to a post
function checkIfCommentBelongsToPost(comment, postId) {
  if (comment.post_id !== postId) {
    const err = new Error("Comment not found for this post");
    err.status = 404;
    throw err;
  }
}

module.exports = {
  checkIfCommentExists,
  checkIfCommentBelongsToPost,
};
