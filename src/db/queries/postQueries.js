const { post } = require("../../app");
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

async function publishPost(post_id) {
  const result = await pool.query(
    `
    UPDATE posts
    SET published = TRUE, 
        published_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
    [post_id]
  );
  return result.rows[0];
}

async function updatePost(post_id, title, body) {
  const result = await pool.query(
    `
    UPDATE posts
    SET title = COALESCE($2, title),
        body = COALESCE($3, body),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
    [post_id, title, body]
  );
  return result.rows[0];
}
