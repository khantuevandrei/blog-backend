const {
  createPost: createPostQuery,
  publishPost: publishPostQuery,
  getPostById: getPostByIdQuery,
} = require("../db/queries/postsQueries");

async function createPost(req, res) {
  try {
    const { title, body } = req.body;

    // Require title & body
    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }

    // Use authenticated user ID as author_id
    const authorId = req.user.id;

    // Create post
    const post = await createPostQuery(authorId, title, body);

    // Return created post
    return res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function publishPost(req, res) {
  try {
    const { postId } = req.body;

    // Require post id
    if (!postId) {
      return res.status(400).json({ message: "Post id is required" });
    }

    // Find post
    const foundPost = await getPostByIdQuery(postId);

    // If no post
    if (!foundPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only author can publish
    if (foundPost.author_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to publish this post" });
    }

    // Publish and return post
    const publishedPost = await publishPostQuery(postId);
    return res.status(200).json(publishedPost);
  } catch (err) {
    console.error("Error publishing post", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { createPost, publishPost };
