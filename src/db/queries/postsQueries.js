const pool = require("../pool");

async function getPostById(postId) {
  const postResult = await pool.query(
    `
    INSERT INTO posts (author_id, title, body)
    VALUES ($1, $2, $3)
    RETURNING id, author_id, title, body, published_at, created_at, updated_at
    `,
    [authorId, title, body]
  );
  const post = postResult.rows[0];
  if (!post) return null;

  const authorResult = await pool.query(
    `
    SELECT id, username, email
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [authorId]
  );
  const author = authorResult.rows[0] || null;

  const commentsResult = await pool.query(
    `
    SELECT c.id, c.body AS content, c.created_at, 
           json_build_object('id', u.id, 'username', u.username) AS author
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at DESC
    `,
    [post.id]
  );
  const comments = commentsResult.rows || [];

  return {
    id: post.id,
    title: post.title,
    content: post.body,
    created_at: post.created_at,
    updated_at: post.updated_at,
    published_at: post.published_at,
    author,
    comments,
  };
}

async function createPost(authorId, title, body) {
  const postResult = await pool.query(
    `
    INSERT INTO posts (author_id, title, body)
    VALUES ($1, $2, $3)
    RETURNING id, author_id, title, body, published_at, created_at, updated_at
    `,
    [authorId, title, body]
  );
  const post = postResult.rows[0];
  if (!post) return null;

  const authorResult = await pool.query(
    `
    SELECT id, username, email
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [authorId]
  );
  const author = authorResult.rows[0];

  return {
    id: post.id,
    title: post.title,
    content: post.body,
    created_at: post.created_at,
    updated_at: post.updated_at,
    published_at: post.published_at,
    author: author || null,
    comments: [],
  };
}

async function updatePost(postId, title, body) {
  const postResult = await pool.query(
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
  const post = postResult.rows[0];
  if (!post) return null;

  const authorResult = await pool.query(
    `
    SELECT id, username, email
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [post.author_id]
  );
  const author = authorResult.rows[0];

  const commentsResult = await pool.query(
    `
    SELECT c.id, c.body AS content, c.created_at, 
           json_build_object('id', u.id, 'username', u.username) AS author
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at DESC
    `,
    [postId]
  );
  const comments = commentsResult.rows;

  return {
    id: post.id,
    title: post.title,
    content: post.body,
    created_at: post.created_at,
    updated_at: post.updated_at,
    published_at: post.published_at,
    author: author || null,
    comments: comments || [],
  };
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
