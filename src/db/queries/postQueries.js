const { post } = require("../../app");
const pool = require("../pool");

async function createPost(authorId, title, body) {
  const result = await pool.query(
    `
    INSERT INTO posts (author_id, title, body)
    VALUES ($1, $2, $3)
    RETURNING *
  `,
    [authorId, title, body]
  );
  return result.rows[0];
}

async function publishPost(postId) {
  const result = await pool.query(
    `
    UPDATE posts
    SET published = TRUE, 
        published_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
    [postId]
  );
  return result.rows[0];
}

async function updatePost(postId, title, body) {
  const result = await pool.query(
    `
    UPDATE posts
    SET title = COALESCE($2, title),
        body = COALESCE($3, body),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
    [postId, title, body]
  );
  return result.rows[0];
}

async function deletePost(postId) {
  const result = await pool.query(
    `
    DELETE FROM posts
    WHERE id = $1
    RETURNING *
  `,
    [postId]
  );
  return result.rows[0];
}
