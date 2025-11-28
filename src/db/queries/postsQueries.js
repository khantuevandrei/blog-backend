const pool = require("../pool");

// Helper to fetch comments for given post IDs with optional limit
async function fetchComments(postIds, limit = 5) {
  if (!postIds || postIds.length === 0 || limit <= 0) return {};

  const commentsResult = await pool.query(
    `
    SELECT 
      c.id,
      c.post_id,
      c.body,
      c.created_at,
      json_build_object('id', u.id, 'username', u.username) AS author,
      COUNT(*) OVER (PARTITION BY c.post_id) AS total_comments
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ANY($1)
    ORDER BY c.created_at DESC
    `,
    [postIds]
  );

  const commentsByPost = {};
  const totalCommentsMap = {};

  for (const c of commentsResult.rows) {
    if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = [];
    if (commentsByPost[c.post_id].length < limit) {
      commentsByPost[c.post_id].push({
        id: c.id,
        body: c.body,
        created_at: c.created_at,
        author: c.author,
      });
    }
    totalCommentsMap[c.post_id] = Number(c.total_comments);
  }

  return { commentsByPost, totalCommentsMap };
}

// Fetch single post by ID with optional comments
async function getPostById(postId, commentLimit = 5) {
  commentLimit = Math.max(0, Math.min(commentLimit, 50));

  const postResult = await pool.query(
    `
    SELECT 
      p.id, p.user_id, p.title, p.body, p.published_at, p.created_at, p.updated_at,
      json_build_object('id', u.id, 'username', u.username) AS author
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = $1
    LIMIT 1
    `,
    [postId]
  );

  const post = postResult.rows[0];
  if (!post) return null;

  const { commentsByPost } = await fetchComments([postId], commentLimit);

  return { ...post, comments: commentsByPost[postId] || [] };
}

// Create a new post
async function createPost(authorId, title, body) {
  const postResult = await pool.query(
    `
    INSERT INTO posts (user_id, title, body)
    VALUES ($1, $2, $3)
    RETURNING id, title, body, published_at, created_at, updated_at
    `,
    [authorId, title, body]
  );
  const createdPost = postResult.rows[0];
  if (!createdPost) return null;

  const authorResult = await pool.query(
    `SELECT id, username FROM users WHERE id = $1 LIMIT 1`,
    [authorId]
  );
  const author = authorResult.rows[0] || null;

  return { ...createdPost, author, comments: [] };
}

// Update post and fetch optional comments
async function updatePost(postId, title, body, commentLimit = 5) {
  commentLimit = Math.max(0, Math.min(commentLimit, 50));

  const postsResult = await pool.query(
    `
    UPDATE posts
    SET title = COALESCE($2, title),
        body = COALESCE($3, body),
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, title, body, published_at, created_at, updated_at, user_id
    `,
    [postId, title, body]
  );
  const updatedPost = postsResult.rows[0];
  if (!updatedPost) return null;

  const authorResult = await pool.query(
    `SELECT id, username FROM users WHERE id = $1 LIMIT 1`,
    [updatedPost.user_id]
  );
  const author = authorResult.rows[0] || null;

  const { commentsByPost } = await fetchComments([postId], commentLimit);

  return { ...updatedPost, author, comments: commentsByPost[postId] || [] };
}

// Delete post
async function deletePost(postId) {
  const deletedResult = await pool.query(
    `
    DELETE FROM posts
    WHERE id = $1
    RETURNING id, user_id, title, body, published_at, created_at, updated_at
    `,
    [postId]
  );
  const deletedPost = deletedResult.rows[0];
  if (!deletedPost) return null;

  const authorResult = await pool.query(
    `SELECT id, username FROM users WHERE id = $1 LIMIT 1`,
    [deletedPost.user_id]
  );
  const author = authorResult.rows[0] || null;

  return { ...deletedPost, author, comments: [] };
}

// Publish post
async function publishPost(postId) {
  const publishedResult = await pool.query(
    `
    UPDATE posts
    SET published = TRUE,
        published_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, user_id, title, body, published_at, created_at, updated_at
    `,
    [postId]
  );
  const publishedPost = publishedResult.rows[0];
  if (!publishedPost) return null;

  const authorResult = await pool.query(
    `SELECT id, username FROM users WHERE id = $1 LIMIT 1`,
    [publishedPost.user_id]
  );
  const author = authorResult.rows[0] || null;

  return { ...publishedPost, author, comments: [] };
}

// Get published posts with comments
async function getPublishedPosts(limit = 10, offset = 0, commentLimit = 5) {
  limit = Math.max(1, Math.min(limit, 50));
  offset = Math.max(0, offset);
  commentLimit = Math.max(0, Math.min(commentLimit, 50));

  const postsResult = await pool.query(
    `
    SELECT p.id, p.title, p.body, p.created_at, p.updated_at, p.published_at,
           json_build_object('id', u.id, 'username', u.username) AS author
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.published = TRUE
    ORDER BY p.published_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  const posts = postsResult.rows;
  if (posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);
  const { commentsByPost, totalCommentsMap } = await fetchComments(
    postIds,
    commentLimit
  );

  return posts.map((p) => ({
    ...p,
    comments: commentsByPost[p.id] || [],
    total_comments: totalCommentsMap[p.id] || 0,
  }));
}

// Get posts for a specific author
async function getAuthorPosts(
  authorId,
  limit = 10,
  offset = 0,
  commentLimit = 5
) {
  limit = Math.max(1, Math.min(limit, 50));
  offset = Math.max(0, offset);
  commentLimit = Math.max(0, Math.min(commentLimit, 50));

  const postsResult = await pool.query(
    `
    SELECT p.id, p.title, p.body, p.published_at, p.created_at, p.updated_at,
           json_build_object('id', u.id, 'username', u.username) AS author
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [authorId, limit, offset]
  );

  const posts = postsResult.rows;
  if (posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);
  const { commentsByPost } = await fetchComments(postIds, commentLimit);

  return posts.map((p) => ({
    ...p,
    comments: commentsByPost[p.id] || [],
  }));
}

module.exports = {
  getPostById,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  getPublishedPosts,
  getAuthorPosts,
};
