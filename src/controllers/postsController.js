const catchError = require("../helpers/catchError");
const { checkId, checkTextField } = require("../helpers/validators/general");
const { checkIfAuthorized } = require("../helpers/validators/users");
const { checkIfPostExists } = require("../helpers/validators/posts");
const {
  createPost: createPostQuery,
  updatePost: updatePostQuery,
  deletePost: deletePostQuery,
  publishPost: publishPostQuery,
  getPublishedPosts: getPublishedPostsQuery,
  getAuthorPosts: getAuthorPostsQuery,
} = require("../db/queries/postsQueries");

// Get a single post by ID
// - Validates postId
// - Ensures the post exists
// - Returns post with comments

async function getPostById(req, res) {
  const postId = checkId(req.params.postId, "Post ID");

  const foundPost = await checkIfPostExists(postId);

  return res.status(200).json(foundPost);
}

// Create a new post
// - Validates title/body fields
// - Returns new post

async function createPost(req, res) {
  const title = checkTextField(req.body.title, "Title");
  const body = checkTextField(req.body.body, "Body");
  const authorId = req.user.id;

  const post = await createPostQuery(authorId, title, body);
  return res.status(201).json(post);
}

// Create a new post
// - Validates title/body fields
// - Returns new post

async function updatePost(req, res) {
  const postId = checkId(req.params.postId, "Post ID");
  const title = req.body.title?.trim();
  const body = req.body.body?.trim();
  const userId = req.user.id;

  if (!title && !body) {
    return res.status(400).json({ message: "Title or body is required" });
  }
  const foundPost = await checkIfPostExists(postId);
  checkIfAuthorized(foundPost, userId);

  const updatedPost = await updatePostQuery(
    postId,
    title || null,
    body || null
  );
  return res.status(200).json(updatedPost);
}

// Delete a post
// - Validates postId
// - Ensures post exists
// - Ensures user is authorized
// - Returns deleted post

async function deletePost(req, res) {
  const postId = checkId(req.params.postId, "Post ID");
  const userId = req.user.id;

  const foundPost = await checkIfPostExists(postId);
  checkIfAuthorized(foundPost, userId);

  const deletedPost = await deletePostQuery(postId);
  return res.status(200).json(deletedPost);
}

// Publish a post
// - Validates postId
// - Ensures post exists
// - Ensures user is authorized
// - Returns published post

async function publishPost(req, res) {
  const postId = checkId(req.params.postId, "Post ID");
  const userId = req.user.id;

  const foundPost = await checkIfPostExists(postId);
  checkIfAuthorized(foundPost, userId);

  const publishedPost = await publishPostQuery(postId);
  return res.status(200).json(publishedPost);
}

// Get published posts with pagination
// - Supports limit, offset, and commentLimit
// - Returns published posts with nested comments

async function getPublishedPosts(req, res) {
  const limit = Number(req.query.limit) || 10;
  const offset = Number(req.query.offset) || 0;
  const commentLimit = Number(req.query.commentLimit) || 5;

  const publishedPosts = await getPublishedPostsQuery(
    limit,
    offset,
    commentLimit
  );
  return res.status(200).json(publishedPosts);
}

// Get posts created by the author
// - Supports pagination
// - Returns author's posts

async function getAuthorPosts(req, res) {
  const authorId = req.user.id;
  const limit = Number(req.query.limit) || 10;
  const offset = Number(req.query.offset) || 0;
  const commentLimit = Number(req.query.commentLimit) || 5;

  const authorPosts = await getAuthorPostsQuery(
    authorId,
    limit,
    offset,
    commentLimit
  );
  return res.status(200).json(authorPosts);
}

module.exports = {
  getPostById: catchError(getPostById),
  createPost: catchError(createPost),
  updatePost: catchError(updatePost),
  deletePost: catchError(deletePost),
  publishPost: catchError(publishPost),
  getPublishedPosts: catchError(getPublishedPosts),
  getAuthorPosts: catchError(getAuthorPosts),
};
