const catchError = require("../helpers/catchError");
const {
  checkId,
  checkBody,
  checkIfAuthorized,
  checkIfCommentExists,
  checkIfPostExists,
} = require("../helpers/validators");
const {
  createComment: createCommentQuery,
  updateComment: updateCommentQuery,
  deleteComment: deleteCommentQuery,
  getPostComments: getPostCommentsQuery,
} = require("../db/queries/commentsQueries");

// Get a single comment by ID
async function getCommentById(req, res) {
  const commentId = checkId(req.params.commentId, "Comment ID");
  const foundComment = await checkIfCommentExists(commentId);
  return res.status(200).json(foundComment);
}

// Create a new comment for a post
async function createComment(req, res) {
  const postId = checkId(req.body.postId, "Post ID");
  const body = checkBody(req.body.body, "Comment");
  const userId = req.user.id;

  await checkIfPostExists(postId);
  const comment = await createCommentQuery(postId, userId, body);
  return res.status(201).json(comment);
}

// Update an existing comment by ID
async function updateComment(req, res) {
  const commentId = checkId(req.params.commentId, "Comment ID");
  const body = checkBody(req.body.body, "Comment");
  const userId = req.user.id;

  const foundComment = await checkIfCommentExists(commentId);
  checkIfAuthorized(foundComment, userId);
  const updatedComment = await updateCommentQuery(commentId, body, userId);
  return res.status(200).json(updatedComment);
}

// Delete a comment by ID
async function deleteComment(req, res) {
  const commentId = checkId(req.params.commentId, "Comment ID");
  const userId = req.user.id;

  const foundComment = await checkIfCommentExists(commentId);
  checkIfAuthorized(foundComment, userId);
  const deletedComment = await deleteCommentQuery(commentId, userId);
  return res.status(200).json(deletedComment);
}

// Get all comments for a post (with pagination)
async function getPostComments(req, res) {
  const limit = Number(req.query.limit) || 5;
  const offset = Number(req.query.offset) || 0;
  const postId = checkId(req.params.postId, "Post ID");

  await checkIfPostExists(postId);
  const postComments = await getPostCommentsQuery(postId, limit, offset);
  return res.status(200).json(postComments);
}

module.exports = {
  getCommentById: catchError(getCommentById),
  createComment: catchError(createComment),
  updateComment: catchError(updateComment),
  deleteComment: catchError(deleteComment),
  getPostComments: catchError(getPostComments),
};
