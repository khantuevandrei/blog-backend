# blog-backend

This is a backend repo of the blog-api project

Framework: Express
Database: Postgres
Authentication: Local + JWT

Packages used: express cors helmet passport passport-local passport-jwt bcrypt jsonwebtoken pg dotenv

# API Documentation

Base URL: `/api`

---

## Auth Routes

### Register User

**POST** `/auth/register`
**Auth:** No
**Body:**

```json
{
  "username": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**Response Example:**

```json
{
  "id": 1,
  "username": "john",
  "role": "user",
  "created_at": "2025-11-29T12:00:00Z"
}
```

**Description:** Create a new user account.

---

### Login User

**POST** `/auth/login`
**Auth:** No
**Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response Example:**

```json
{
  "token": "JWT_TOKEN_HERE"
}
```

**Description:** Authenticate user and receive JWT.

---

## Posts Routes

### Get Published Posts

**GET** `/posts`
**Auth:** No
**Response Example:**

```json
[
  {
    "id": 1,
    "title": "Post 1",
    "body": "Content",
    "published_at": "2025-11-29T12:00:00Z",
    "created_at": "...",
    "updated_at": "...",
    "author": { "id": 1, "username": "john" },
    "comments": [
      {
        "id": 1,
        "body": "Nice post!",
        "created_at": "...",
        "author": { "id": 2, "username": "alice" }
      }
    ],
    "total_comments": 1
  }
]
```

**Description:** Get all published posts.

### Create Post

**POST** `/posts`
**Auth:** JWT required
**Body:**

```json
{
  "title": "string",
  "body": "string"
}
```

**Response Example:**

```json
{
  "id": 2,
  "title": "New Post",
  "body": "Content",
  "published_at": null,
  "created_at": "...",
  "updated_at": "...",
  "author": { "id": 1, "username": "john" },
  "comments": []
}
```

**Description:** Create a new post.

### Get Current Author's Posts

**GET** `/posts/author`
**Auth:** JWT required
**Response Example:**

```json
[
  {
    "id": 2,
    "title": "New Post",
    "body": "Content",
    "published_at": null,
    "created_at": "...",
    "updated_at": "...",
    "author": { "id": 1, "username": "john" },
    "comments": []
  }
]
```

**Description:** Get posts created by the authenticated user.

### Get Post by ID

**GET** `/posts/:postId`
**Auth:** No
**Response Example:**

```json
{
  "id": 1,
  "title": "Post 1",
  "body": "Content",
  "published_at": "...",
  "created_at": "...",
  "updated_at": "...",
  "author": { "id": 1, "username": "john" },
  "comments": [
    {
      "id": 1,
      "body": "Nice post!",
      "created_at": "...",
      "author": { "id": 2, "username": "alice" }
    }
  ]
}
```

**Description:** Retrieve a single post.

### Update Post

**PUT** `/posts/:postId`
**Auth:** JWT required
**Body:**

```json
{
  "title": "Updated",
  "body": "Updated content"
}
```

**Response Example:**

```json
{
  "id": 1,
  "title": "Updated",
  "body": "Updated content",
  "published_at": "...",
  "created_at": "...",
  "updated_at": "...",
  "author": { "id": 1, "username": "john" },
  "comments": [ ... ]
}
```

**Description:** Update a post.

### Delete Post

**DELETE** `/posts/:postId`
**Auth:** JWT required
**Response Example:**

```json
{
  "id": 1,
  "title": "Post 1",
  "body": "Content",
  "published_at": "...",
  "created_at": "...",
  "updated_at": "...",
  "author": { "id": 1, "username": "john" },
  "comments": []
}
```

**Description:** Delete a post.

### Publish Post

**PATCH** `/posts/:postId/publish`
**Auth:** JWT required
**Response Example:**

```json
{
  "id": 1,
  "title": "Post 1",
  "body": "Content",
  "published_at": "2025-11-29T12:00:00Z",
  "created_at": "...",
  "updated_at": "...",
  "author": { "id": 1, "username": "john" },
  "comments": []
}
```

**Description:** Publish a post.

---

## Comments Routes (Nested under Posts)

### Get All Comments for a Post

**GET** `/posts/:postId/comments`
**Auth:** No
**Query Params:** `limit` (default 5), `offset` (default 0)
**Response Example:**

```json
[
  {
    "id": 1,
    "body": "Nice post!",
    "created_at": "...",
    "updated_at": "...",
    "author": { "id": 2, "username": "alice" }
  }
]
```

**Description:** Retrieve all comments for a post.

### Create Comment

**POST** `/posts/:postId/comments`
**Auth:** JWT required
**Body:**

```json
{
  "body": "Great post!"
}
```

**Response Example:**

```json
{
  "id": 2,
  "post_id": 1,
  "body": "Great post!",
  "created_at": "...",
  "updated_at": "...",
  "author": { "id": 1, "username": "john" }
}
```

**Description:** Create a new comment for a post.

### Get Comment by ID

**GET** `/posts/:postId/comments/:commentId`
**Auth:** No
**Response Example:**

```json
{
  "id": 1,
  "post_id": 1,
  "body": "Nice post!",
  "created_at": "...",
  "updated_at": "...",
  "author": { "id": 2, "username": "alice" }
}
```

**Description:** Get a single comment.

### Update Comment

**PUT** `/posts/:postId/comments/:commentId`
**Auth:** JWT required
**Body:**

```json
{
  "body": "Updated comment"
}
```

**Response Example:**

```json
{
  "id": 1,
  "post_id": 1,
  "body": "Updated comment",
  "created_at": "...",
  "updated_at": "...",
  "author": { "id": 2, "username": "alice" }
}
```

**Description:** Update a comment.

### Delete Comment

**DELETE** `/posts/:postId/comments/:commentId`
**Auth:** JWT required
**Response Example:**

```json
{
  "id": 1,
  "post_id": 1,
  "body": "Nice post!",
  "created_at": "...",
  "updated_at": "...",
  "author": { "id": 2, "username": "alice" }
}
```

**Description:** Delete a comment.

---

### Notes

- JWT-protected routes require `Authorization: Bearer <token>` header.
- Comments are always scoped under posts.
- Pagination: `/posts/:postId/comments?limit=5&offset=0` (default `limit=5`, `offset=0`).
- `created_at` and `updated_at` timestamps are ISO strings.
