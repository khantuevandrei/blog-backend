const pool = require("../pool");

// Get comment by ID
async function getCommentById(commentId) {
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.post_id,
      c.user_id,
      c.body,
      c.created_at,
      c.updated_at,
      json_build_object('id', u.id, 'username', u.username) AS author
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = $1
    LIMIT 1
    `,
    [commentId]
  );
  return result.rows[0] || null;
}

// Create comment
async function createComment(postId, userId, body) {
  const commentResult = await pool.query(
    `
  INSERT INTO comments (post_id, user_id, body)
  VALUES ($1, $2, $3)
  RETURNING id, post_id, user_id, body, created_at, updated_at
  `,
    [postId, userId, body]
  );
  const comment = commentResult.rows[0];

  // fetch author separately
  const authorResult = await pool.query(
    `SELECT id, username FROM users WHERE id = $1 LIMIT 1`,
    [userId]
  );
  const author = authorResult.rows[0] || null;

  return { ...comment, author };
}

// Update comment
async function updateComment(commentId, body, userId) {
  const commentResult = await pool.query(
    `
  UPDATE comments
  SET body = $2, updated_at = NOW()
  WHERE id = $1 AND user_id = $3
  RETURNING id, post_id, user_id, body, created_at, updated_at
  `,
    [commentId, body, userId]
  );
  const comment = commentResult.rows[0];
  if (!comment) return null;

  const authorResult = await pool.query(
    `SELECT id, username FROM users WHERE id = $1 LIMIT 1`,
    [userId]
  );
  const author = authorResult.rows[0] || null;

  return { ...comment, author };
}

// Delete comment
async function deleteComment(commentId, userId) {
  const result = await pool.query(
    `
    DELETE FROM comments
    WHERE id = $1 AND user_id = $2
    RETURNING 
      id,
      post_id,
      user_id,
      body,
      created_at,
      updated_at,
      (SELECT json_build_object('id', u.id, 'username', u.username) 
       FROM users u 
       WHERE u.id = comments.user_id) AS author
    `,
    [commentId, userId]
  );
  return result.rows[0] || null;
}

// Get paginated comments for a post
async function getPostComments(postId, limit = 5, offset = 0) {
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.body,
      c.created_at,
      c.updated_at,
      json_build_object('id', u.id, 'username', u.username) AS author
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [postId, limit, offset]
  );
  return result.rows;
}

module.exports = {
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
};
