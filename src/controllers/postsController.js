const {
  createPost: createPostQuery,
  publishPost: publishPostQuery,
  getPostById: getPostByIdQuery,
  updatePost: updatePostQuery,
  deletePost: deletePostQuery,
  getAllPublishedPosts: getAllPublishedPostsQuery,
  getAllAuthorPosts: getAllAuthorPostsQuery,
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

async function updatePost(req, res) {
  try {
    const { title, body } = req.body;
    const { postId } = req.params;

    // Require title or body
    if (!title && !body) {
      return res.status(400).json({ message: "Title or body is required" });
    }

    const postIdNum = Number(postId);

    if (isNaN(postIdNum)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const postTitle = title || null;
    const postBody = body || null;

    // Find post
    const foundPost = await getPostByIdQuery(postId);

    // If no post
    if (!foundPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only author can update
    if (foundPost.author_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    // Update and return post
    const updatedPost = await updatePostQuery(postIdNum, postTitle, postBody);
    return res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error updating post", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function deletePost(req, res) {
  try {
    const { postId } = req.params;
    const postIdNum = Number(postId);

    if (isNaN(postIdNum)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    // Find post
    const foundPost = await getPostByIdQuery(postIdNum);

    // If no post
    if (!foundPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only author can delete
    if (foundPost.author_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    // Delete and return post
    const deletedPost = await deletePostQuery(postIdNum);
    return res.status(200).json(deletedPost);
  } catch (err) {
    console.error("Error deleting post", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getPostById(req, res) {
  try {
    const { postId } = req.params;
    const postIdNum = Number(postId);

    if (isNaN(postIdNum)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    // Find post
    const foundPost = await getPostByIdQuery(postIdNum);

    // If no post
    if (!foundPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Return post
    return res.status(200).json(foundPost);
  } catch (err) {
    console.error("Error getting post", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getAllPublishedPosts(req, res) {
  try {
    // Find published posts
    const publishedPosts = await getAllPublishedPostsQuery();

    // Return published posts
    return res.status(200).json(publishedPosts);
  } catch (err) {
    console.error("Error getting all published posts", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getAllAuthorPosts(req, res) {
  try {
    const authorId = req.user.id;

    // Get all author posts
    const authorPosts = await getAllAuthorPostsQuery(authorId);

    // Return author posts
    return res.status(200).json(authorPosts);
  } catch (err) {
    console.error("Error getting all author posts", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createPost,
  publishPost,
  updatePost,
  deletePost,
  getPostById,
  getAllPublishedPosts,
  getAllAuthorPosts,
};
