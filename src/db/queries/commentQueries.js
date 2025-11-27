const pool = require("../pool");

async function createComment(postId, userId, body) {
  const result = await pool.query(
    `
    INSERT INTO comments (post_id, user_id, body)
    VALUES ($1, $2, $3)
    RETURNING id, post_id, user_id, body, created_at, updated_at
  `,
    [postId, userId, body]
  );
  return result.rows[0] || null;
}

async function updateComment(commentId, body) {
  const result = await pool.query(
    `
    UPDATE comments
    SET body = $2,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, post_id, user_id, body, created_at, updated_at
  `,
    [commentId, body]
  );
  return result.rows[0] || null;
}

async function deleteComment(commentId) {
  const result = await pool.query(
    `
    DELETE FROM comments
    WHERE id = $1
    RETURNING id, post_id, user_id, body, created_at, updated_at
  `,
    [commentId]
  );
  return result.rows[0] || null;
}

async function getCommentsForPost(postId) {
  const result = await pool.query(
    `
    SELECT id, post_id, user_id, body, created_at, updated_at
    FROM comments
    WHERE post_id = $1
    ORDER BY created_at DESC
  `,
    [postId]
  );
  return result.rows;
}

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getCommentsForPost,
};
