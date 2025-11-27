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
