const { getPostById } = require("../../db/queries/postsQueries");

// Check if post exists
async function checkIfPostExists(postId) {
  const post = await getPostById(postId);
  if (!post) {
    const err = new Error("Post not found");
    err.status = 404;
    throw err;
  }
  return post;
}

module.exports = {
  checkIfPostExists,
};
