const pool = require("../pool");

async function getCommentById(commentId) {
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.body,
      c.created_at,
      c.updated_at,
      json_build_object(
        'id', u.id,
        'username', u.username
      ) AS author
    FROM comments c 
    JOIN users u ON c.user_id = u.id
    WHERE c.id = $1
    LIMIT 1
    `,
    [commentId]
  );
  return result.rows[0] || null;
}

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
  if (!comment) return null;

  const authorResult = await pool.query(
    `SELECT id, username FROM users WHERE id  = $1 LIMIT 1`,
    [userId]
  );
  const author = authorResult.rows[0] || null;

  return {
    ...comment,
    author: author,
  };
}

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

  return {
    ...comment,
    author: author,
  };
}

async function deleteComment(commentId, userId) {
  const commentResult = await pool.query(
    `
    DELETE FROM comments
    WHERE id = $1 AND user_id = $2
    RETURNING id, post_id, user_id, body, created_at, updated_at
    `,
    [commentId, userId]
  );
  const comment = commentResult.rows[0];
  if (!comment) return null;

  const authorResult = await pool.query(
    `SELECT id, username FROM users WHERE id = $1`,
    [userId]
  );
  const author = authorResult.rows[0] || null;

  return {
    ...comment,
    author: author,
  };
}

async function getPostComments(postId, limit = 5, offset = 0) {
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.body,
      c.created_at,
      c.updated_at,
      json_build_object(
        'id', u.id,
        'username', u.username
      ) AS author
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
