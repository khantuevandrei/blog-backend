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
  const postResult = await pool.query(
    `
    SELECT id, author_id, title, body, published_at, created_at, updated_at
    FROM posts
    WHERE id = $1
    LIMIT 1
    `,
    [postId]
  );
  const post = postResult.rows[0];
  if (!post) return null;

  const deletedResult = await pool.query(
    `
    DELETE FROM posts
    WHERE id = $1
    RETURNING id, author_id, title, body, published_at, created_at, updated_at
    `,
    [postId]
  );
  const deletedPost = deletedResult.rows[0];
  if (!deletedPost) return null;

  const authorResult = await pool.query(
    `
    SELECT id, username, email
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [deletedPost.author_id]
  );
  const author = authorResult.rows[0] || null;

  const comments = [];

  return {
    id: deletedPost.id,
    title: deletedPost.title,
    content: deletedPost.body,
    created_at: deletedPost.created_at,
    updated_at: deletedPost.updated_at,
    published_at: deletedPost.published_at,
    author,
    comments,
  };
}

async function publishPost(postId) {
  const postResult = await pool.query(
    `
    SELECT id, author_id, title, body, published_at, created_at, updated_at
    FROM posts
    WHERE id = $1
    LIMIT 1
    `,
    [postId]
  );
  const post = postResult.rows[0];
  if (!post) return null;

  const publishedResult = await pool.query(
    `
    UPDATE posts
    SET published = TRUE,
        published_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, author_id, title, body, published_at, created_at, updated_at
    `,
    [postId]
  );
  const publishedPost = publishedResult.rows[0];
  if (!publishedPost) return null;

  const authorResult = await pool.query(
    `
    SELECT id, username, email
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [publishedPost.author_id]
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
    [postId]
  );
  const comments = commentsResult.rows || [];

  return {
    id: publishedPost.id,
    title: publishedPost.title,
    content: publishedPost.body,
    created_at: publishedPost.created_at,
    updated_at: publishedPost.updated_at,
    published_at: publishedPost.published_at,
    author,
    comments,
  };
}

async function getAllPublishedPosts(limit = 10, offset = 0, commentLimit = 5) {
  // Fetch posts with author info
  const postsResult = await pool.query(
    `
    SELECT 
      p.id,
      p.title,
      p.body AS content,
      p.created_at,
      p.updated_at,
      p.published_at,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email
      ) AS author
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.published = TRUE
    ORDER BY p.published_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );
  const posts = postsResult.rows;

  if (posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);

  // Fetch comments for theses posts
  const commentsResult = await pool.query(
    `
    SELECT 
      c.id,
      c.body AS content,
      c.created_at,
      c.post_id,
      json_build_object(
        'id', u.id,
        'username', u.username
      ) AS author
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ANY($1)
    ORDER BY c.created_at DESC
    `,
    [postIds]
  );
  const allComments = commentsResult.rows;

  // Limit comments per post
  const commentsByPost = {};
  postIds.forEach((id) => (commentsByPost[id] = []));
  for (const comment of allComments) {
    if (commentsByPost[comment.post_id].length < commentLimit) {
      commentsByPost[comment.post_id].push(comment);
    }
  }

  // Count totla comments per post
  const countsResult = await pool.query(
    `
    SELECT post_id, COUNT(*) AS total_comments
    FROM comments
    WHERE post_id = ANY($1)
    GROUP BY post_id
    `,
    [postIds]
  );
  const totalCommentsMap = {};
  countsResult.rows.forEach((row) => {
    totalCommentsMap[row.post_id] = Number(row.total_comments);
  });

  // Build final response
  const response = posts.map((post) => ({
    ...post,
    comments: commentsByPost[post.id] || [],
    total_comments: totalCommentsMap[post.id] || 0,
  }));

  return response;
}

async function getAllAuthorPosts(
  authorId,
  limit = 10,
  offset = 0,
  commentLimit = 5
) {
  // Fetch posts for author
  const postsResult = await pool.query(
    `
    SELECT 
      p.id, p.title, p.body AS content, p.published_at, p.created_at, p.updated_at,
      json_build_object('id', u.id, 'username', u.username, 'email', u.email) AS author
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.author_id = $1
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [authorId, limit, offset]
  );
  const posts = postsResult.rows;

  if (posts.length === 0) return [];

  // Fetch comments for these posts
  const postIds = posts.map((p) => p.id);

  const commentsResult = await pool.query(
    `
    SELECT c.id, c.post_id, c.body AS content, c.created_at,
           json_build_object('id', u.id, 'username', u.username) AS author
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ANY($1)
    ORDER BY c.created_at DESC
    `,
    [postIds]
  );
  const allComments = commentsResult.rows;

  // Group comments by post and limit per post
  const commentsByPost = {};
  for (const comment of allComments) {
    if (!commentsByPost[comment.post_id]) commentsByPost[comment.post_id] = [];
    if (commentsByPost[comment.post_id].length < commentLimit) {
      commentsByPost[comment.post_id].push(comment);
    }
  }

  // Attach comments to posts
  const finalPosts = posts.map((post) => ({
    ...post,
    comments: commentsByPost[post.id] || [],
  }));

  return finalPosts;
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
