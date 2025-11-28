const pool = require("../pool");

async function getPostById(postId) {
  const result = await pool.query(
    `
    SELECT 
      p.id,
      p.title,
      p.content,
      p.created_at,
      p.updated_at,

      u.id AS author_id,
      u.username AS author_username,
      u.email AS author_email,

      COALESCE(
          json_agg(
              json_build_object(
                  'id', c.id,
                  'content', c.content,
                  'created_at', c.created_at,
                  'author', json_build_object(
                      'id', cu.id,
                      'username', cu.username
                  )
              )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
      ) AS comments

    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN comments c ON p.id = c.post_id
    LEFT JOIN users cu ON c.author_id = cu.id
    WHERE p.id = $1
    GROUP BY p.id, u.id;
  `,
    [postId]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: {
      id: row.author_id,
      username: row.author_username,
      email: row.author_email,
    },
    comments: row.comments,
  };
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
