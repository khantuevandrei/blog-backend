const { getCommentById } = require("../db/queries/commentsQueries");
const { getPostById } = require("../db/queries/postsQueries");

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

async function checkIfCommentExists(id) {
  const comment = await getCommentByIdQuery(id);
  if (!comment) {
    const err = new Error("Comment not found");
    err.status = 404;
    throw err;
  }
  return comment;
}

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
