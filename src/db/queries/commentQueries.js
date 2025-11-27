const pool = require("../pool");

async function createComment(postId, userId, body) {
  const result = await pool.query(
    `
    INSERT INTO comments (post_id, user_id, body)
    VALUES ($1, $2, $3)
    RETURNING *
  `,
    [postId, userId, body]
  );
  return result.rows[0];
}

async function updateComment(commentId, body) {
  const result = await pool.query(
    `
    UPDATE comments
    SET body = $2,
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
    [commentId, body]
  );
  return result.rows[0];
}

async function deleteComment(commentId) {
  const result = await pool.query(
    `
    DELETE FROM comments
    WHERE id = $1
    RETURNING *
  `,
    [commentId]
  );
  return result.rows[0];
}
