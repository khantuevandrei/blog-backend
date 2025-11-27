const pool = require("../pool");

async function createPost(author_id, title, body) {
  const result = await pool.query(
    `
    INSERT INTO posts (author_id, title, body)
    VALUES ($1, $2, $3)
    RETURNING *
  `,
    [author_id, title, body]
  );
  return result.rows[0];
}
