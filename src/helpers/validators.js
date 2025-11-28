const { getCommentById } = require("../db/queries/commentsQueries");
const { getPostById } = require("../db/queries/postsQueries");

// Check if id exists and it is numeric
function checkId(id, type = "ID") {
  if (id === undefined || id === null) {
    const err = new Error(`${type} is required`);
    err.status = 400;
    throw err;
  }
  if (isNaN(id)) {
    const err = new Error(`Invalid ${type}`);
    err.status = 400;
    throw err;
  }
  return Number(id);
}

// Check if body exists and it is not empty
function checkBody(body, name = "Body") {
  if (!body || !body.trim()) {
    const err = new Error(`${name} is required`);
    err.status = 400;
    throw err;
  }
  return body.trim();
}

// Check if user is authorized to perform a query
function checkIfAuthorized(type, userId) {
  if (type.user_id !== userId) {
    const err = new Error("Not authorized");
    err.status = 403;
    throw err;
  }
}

// Check if comment exists
async function checkIfCommentExists(id) {
  const comment = await getCommentById(id);
  if (!comment) {
    const err = new Error("Comment not found");
    err.status = 404;
    throw err;
  }
  return comment;
}

// Check if post exists
async function checkIfPostExists(id) {
  const post = await getPostById(id);
  if (!post) {
    const err = new Error("Post not found");
    err.status = 404;
    throw err;
  }
}

module.exports = {
  checkId,
  checkBody,
  checkIfAuthorized,
  checkIfCommentExists,
  checkIfPostExists,
};
