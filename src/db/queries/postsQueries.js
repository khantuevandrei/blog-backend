const pool = require("../pool");

async function getPostById(postId) {
  const result = await pool.query(
    `
    SELECT id, author_id, title, body, published_at, created_at, updated_at
    FROM posts
    WHERE id = $1
    LIMIT 1
  `,
    [postId]
  );
  return result.rows[0] || null;
}

async function createPost(authorId, title, body) {
  const result = await pool.query(
    `
    INSERT INTO posts (author_id, title, body)
    VALUES ($1, $2, $3)
    RETURNING id, author_id, title, body, published_at, created_at, updated_at
  `,
    [authorId, title, body]
  );
  return result.rows[0] || null;
}

async function updatePost(postId, title, body) {
  const result = await pool.query(
    `
    UPDATE posts
    SET title = COALESCE($2, title),
        body = COALESCE($3, body),
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, author_id, title, body, published_at, created_at, updated_at
  `,
    [postId, title, body]
  );
  return result.rows[0] || null;
}

async function deletePost(postId) {
  const result = await pool.query(
    `
    DELETE FROM posts
    WHERE id = $1
    RETURNING id, author_id, title, body, published_at, created_at, updated_at
  `,
    [postId]
  );
  return result.rows[0] || null;
}

async function publishPost(postId) {
  const result = await pool.query(
    `
    UPDATE posts
    SET published = TRUE, 
        published_at = NOW()
    WHERE id = $1
    RETURNING id, author_id, title, body, published_at, created_at, updated_at
  `,
    [postId]
  );
  return result.rows[0] || null;
}

async function getAllPublishedPosts() {
  const result = await pool.query(`
    SELECT id, author_id, title, body, published_at, created_at, updated_at
    FROM posts
    WHERE published = TRUE
    ORDER BY published_at DESC
  `);
  return result.rows;
}

async function getAllAuthorPosts(authorId) {
  const result = await pool.query(
    `
    SELECT id, author_id, title, body, published_at, created_at, updated_at
    FROM posts
    WHERE author_id = $1
    ORDER BY created_at DESC
  `,
    [authorId]
  );
  return result.rows;
}

module.exports = {
  getPostById,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  getAllPublishedPosts,
  getAllAuthorPosts,
};
